import json
import sqlite3
from datetime import datetime
import pytz
import dateparser
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
import os

# -------- Configuration -------- #
TIMEZONE = pytz.UTC
now = datetime.now(TIMEZONE)
now_iso = now.isoformat()
DB_FILE = "logs.db"

# -------- Prompt Template: Intent Extraction -------- #
intent_prompt = PromptTemplate.from_template(
    """
You are a log query parser. Given a natural language query, output a JSON object with:

{
  "startDate": "<Start time in ISO 8601 format>",
  "endDate": "<End time in ISO 8601 format (typically now)>",
  "logType": "<ERROR | WARN | INFO | DEBUG | ALL>",
  "pattern": "<Keyword or phrase>"
}

Rules:
- Parse relative time phrases like:
  - "last 5 hours" → 5 hours ago to now
  - "yesterday" → from 00:00 to 23:59 of the previous day
  - "since 3pm" → from 3pm today to now
  - "this morning" → from 00:00 to 12:00 today
  - "past weekend" → previous Saturday 00:00 to Sunday 23:59
  - "today" → from 00:00 today to now
- If no time is mentioned, set both startDate and endDate to null.
- Determine logType from context:
  - If user mentions "error", "failure", "exception" → logType = "ERROR"
  - If user says "info", "logs", "details" → logType = "INFO"
  - Else → logType = "ALL"
- Set pattern as the key phrase that matches what the user is looking for.

Current time is: {now}

User prompt: "{query}"

Respond only in valid JSON.
"""
)

# -------- Prompt Template: Log Summary -------- #
summary_prompt = PromptTemplate.from_template(
    """
You are an intelligent assistant helping a user analyze system logs.

The user has asked a natural language question about their application logs.  
Their request may have sentiment, focus, or intent — such as identifying failures, understanding errors, finding performance issues, or checking success messages.

You have been given the user’s original query, and a list of log entries fetched from the database. These logs have already been filtered by time window and optional pattern match.

Your job is to:
1. Understand the **intent and tone** of the user’s original query (e.g., "error investigation", "debugging", "counting successes").
2. Use the log entries as context to form a meaningful and concise answer.
3. If some logs don’t align with the user’s intent (e.g., success logs when user is asking about failures), either ignore or downplay them unless they are clearly relevant.
4. If logs show multiple issues, group them logically by type or service.
5. If the logs are all irrelevant or contain no matches, politely say so and suggest alternative keywords or time ranges.

Respond with a user-friendly, concise, and accurate answer. Emphasize what the logs reveal in the context of the user’s question. Do not repeat the entire logs. Summarize patterns, trends, or important events. You may also include suggested actions if appropriate.

user_query: {user_prompt}  
log_entries:
{log_entries}
"""
)

# -------- LangChain Setup -------- #
llm = ChatOpenAI(temperature=0, model="gpt-4")
memory = ConversationBufferMemory(memory_key="chat_history")
intent_chain = LLMChain(llm=llm, prompt=intent_prompt)
summary_chain = LLMChain(llm=llm, prompt=summary_prompt, memory=memory)

# -------- Utility -------- #
def parse_relative_time(time_phrase, base_time=None):
    base_time = base_time or datetime.now(TIMEZONE)
    dt = dateparser.parse(time_phrase, settings={'RELATIVE_BASE': base_time})
    if dt:
        return dt.astimezone(TIMEZONE).isoformat()
    return None

# -------- SQLite Persistent Log DB -------- #
def init_log_db():
    is_new = not os.path.exists(DB_FILE)
    conn = sqlite3.connect(DB_FILE)
    if is_new:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE logs (
            timestamp TEXT,
            level TEXT,
            message TEXT
        )
        """)

        # Sample logs
        logs = [
            ("2025-07-01T11:15:23Z", "ERROR", "NullPointerException at UserService.java:42"),
            ("2025-07-01T12:20:44Z", "ERROR", "NullPointerException at AuthService.java:88"),
            ("2025-07-01T12:30:00Z", "INFO", "User login succeeded"),
            ("2025-07-01T13:45:00Z", "ERROR", "NullPointerException at PaymentService.java:17"),
            ("2025-07-01T14:05:00Z", "INFO", "Scheduled job started"),
            ("2025-07-01T14:15:00Z", "DEBUG", "Debug mode enabled")
        ]
        cursor.executemany("INSERT INTO logs VALUES (?, ?, ?)", logs)
        conn.commit()
    return conn

# -------- Log Query from DB -------- #
def fetch_logs_from_db(conn, start=None, end=None, pattern=None):
    cursor = conn.cursor()
    query = "SELECT timestamp, level, message FROM logs WHERE 1=1"
    params = []

    if start:
        query += " AND timestamp >= ?"
        params.append(start)
    if end:
        query += " AND timestamp <= ?"
        params.append(end)
    if pattern:
        query += " AND message LIKE ?"
        params.append(f"%{pattern}%")

    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [f"[{level}] {timestamp} {message}" for timestamp, level, message in rows]

# -------- Multi-Turn CLI Loop -------- #
def chat_loop():
    print("\n💬 Start chatting with the Log Assistant (type 'exit' to quit)")
    conn = init_log_db()
    last_query = None
    last_logs = []

    while True:
        user_input = input("\n🧑 You: ").strip()
        if user_input.lower() in ("exit", "quit"):
            print("👋 Goodbye!")
            break

        # Step 1: Run intent extraction
        response = intent_chain.run(query=user_input, now=now_iso)
        try:
            parsed_query = json.loads(response)
        except json.JSONDecodeError:
            print("❌ Could not parse query structure.")
            continue

        # Step 2: Compare with last query
        query_changed = parsed_query != last_query

        # Step 3: Only fetch logs if query changed
        if query_changed:
            start = parse_relative_time(parsed_query.get("startDate")) if parsed_query.get("startDate") else None
            end = parse_relative_time(parsed_query.get("endDate")) if parsed_query.get("endDate") else None
            pattern = parsed_query.get("pattern")
            last_logs = fetch_logs_from_db(conn, start, end, pattern)
            last_query = parsed_query

        # Step 4: Generate final summary using cached or new logs
        log_block = "\n".join(f"- {line}" for line in last_logs)
        summary = summary_chain.run(user_prompt=user_input, log_entries=log_block)

        print("\n🔍 Parsed Query:")
        print(json.dumps(parsed_query, indent=2))
        print("\n🤖 Assistant:\n" + summary)

# -------- Entry Point -------- #
if __name__ == "__main__":
    chat_loop()
