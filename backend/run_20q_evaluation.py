import asyncio
import time
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.embeddings.model_loader import ModelLoader
from app.retrieval.search_service import search_chunks
from app.retrieval.schemas import SearchRequest, RetrievalFilters
from app.ai.service import process_ask
from app.ai.schemas import AskRequest
from app.models.user import UserInDB

EVAL_QUESTIONS = [
    {
        "id": 1,
        "question": "What are Acme Corporation's standard working hours and lunch break?",
        "expected_section": "1",
        "expected_title": "Working Hours and Attendance",
        "key_facts": ["9:00 a.m. to 6:00 p.m.", "Monday through Friday", "one-hour lunch break"]
    },
    {
        "id": 2,
        "question": "What should an employee do if they expect to be late or absent?",
        "expected_section": "1",
        "expected_title": "Working Hours and Attendance",
        "key_facts": ["notify their manager as early as reasonably possible"]
    },
    {
        "id": 3,
        "question": "How many days of paid annual leave are full-time employees entitled to each year?",
        "expected_section": "2",
        "expected_title": "Annual Leave",
        "key_facts": ["20 days", "paid annual leave"]
    },
    {
        "id": 4,
        "question": "How many unused annual leave days can be carried forward into the next calendar year?",
        "expected_section": "2",
        "expected_title": "Annual Leave",
        "key_facts": ["up to 5 unused annual leave days", "five-day carry-forward"]
    },
    {
        "id": 5,
        "question": "How far in advance must annual leave normally be requested?",
        "expected_section": "2",
        "expected_title": "Annual Leave",
        "key_facts": ["at least five working days", "employee leave system"]
    },
    {
        "id": 6,
        "question": "How many paid sick leave days are allowed per calendar year?",
        "expected_section": "3",
        "expected_title": "Sick Leave",
        "key_facts": ["up to 10 paid sick leave days"]
    },
    {
        "id": 7,
        "question": "When may a medical certificate be requested for sick leave?",
        "expected_section": "3",
        "expected_title": "Sick Leave",
        "key_facts": ["more than three consecutive working days"]
    },
    {
        "id": 8,
        "question": "Who is eligible to request remote work and how many days per week are allowed?",
        "expected_section": "4",
        "expected_title": "Remote Work",
        "key_facts": ["completed their probationary period", "up to two working days per week"]
    },
    {
        "id": 9,
        "question": "What are the requirements for employees working remotely?",
        "expected_section": "4",
        "expected_title": "Remote Work",
        "key_facts": ["prior manager approval", "remain reachable", "protect company information", "approved company systems"]
    },
    {
        "id": 10,
        "question": "How long is the standard probationary period for new full-time employees?",
        "expected_section": "5",
        "expected_title": "Probation",
        "key_facts": ["six-month probationary period"]
    },
    {
        "id": 11,
        "question": "Can probation be extended and what is evaluated during probation?",
        "expected_section": "5",
        "expected_title": "Probation",
        "key_facts": ["performance, conduct, attendance, and suitability", "may extend probation"]
    },
    {
        "id": 12,
        "question": "How many weeks of paid parental leave may eligible employees take?",
        "expected_section": "6",
        "expected_title": "Parental Leave",
        "key_facts": ["up to 16 weeks of paid parental leave", "birth or adoption"]
    },
    {
        "id": 13,
        "question": "Within how many days must business expense claims be submitted?",
        "expected_section": "7",
        "expected_title": "Business Expenses",
        "key_facts": ["within 30 days of the expense date", "itemized receipt"]
    },
    {
        "id": 14,
        "question": "What is Acme Corporation's policy on workplace harassment, discrimination, and retaliation?",
        "expected_section": "8",
        "expected_title": "Workplace Respect and Harassment",
        "key_facts": ["free from harassment, discrimination, bullying, and retaliation", "retaliation is prohibited"]
    },
    {
        "id": 15,
        "question": "To whom should concerns about inappropriate workplace conduct be reported?",
        "expected_section": "8",
        "expected_title": "Workplace Respect and Harassment",
        "key_facts": ["manager", "Human Resources", "ethics reporting channel"]
    },
    {
        "id": 16,
        "question": "What are the rules regarding company passwords and security incidents?",
        "expected_section": "9",
        "expected_title": "Information Security",
        "key_facts": ["must not share passwords or authentication codes", "report to IT security team promptly"]
    },
    {
        "id": 17,
        "question": "How often do employees receive formal performance reviews?",
        "expected_section": "10",
        "expected_title": "Performance Reviews",
        "key_facts": ["once each year", "informal check-ins"]
    },
    {
        "id": 18,
        "question": "What is the standard notice period for full-time employee resignation?",
        "expected_section": "11",
        "expected_title": "Resignation and Notice",
        "key_facts": ["30 calendar days", "written notice"]
    },
    {
        "id": 19,
        "question": "Where should employees check for benefits information and enrollment?",
        "expected_section": "12",
        "expected_title": "Employee Benefits",
        "key_facts": ["Human Resources benefits portal"]
    },
    {
        "id": 20,
        "question": "What are the rules regarding company laptops and equipment?",
        "expected_section": "13",
        "expected_title": "Use of Company Equipment",
        "key_facts": ["provided for authorized business purposes", "return company property", "not install unauthorized software"]
    }
]

async def run_eval():
    await connect_to_mongo()
    db = get_database()
    ModelLoader.initialize()

    admin_doc = await db.users.find_one({"email": "admin@eka.com"})
    if not admin_doc:
        admin_doc = {
            "email": "admin@eka.com",
            "full_name": "System Admin",
            "role": "admin",
            "role_status": "approved",
            "is_active": True,
            "created_at": time.time(),
        }
    admin_user = UserInDB(**admin_doc)

    doc_id = "82ec1429-b2e2-4249-912a-8d17e3593293"

    print("=" * 80)
    print("STRUCTURE-AWARE CHUNKING — 20-QUESTION BENCHMARK EVALUATION")
    print("=" * 80)

    retrieval_hits = 0
    top1_section_hits = 0
    total_q = len(EVAL_QUESTIONS)
    results_summary = []

    for q in EVAL_QUESTIONS:
        qid = q["id"]
        qtext = q["question"]
        exp_sec = q["expected_section"]
        exp_title = q["expected_title"]

        # 1. Evaluate Search Knowledge (Semantic Search)
        s_req = SearchRequest(
            query=qtext,
            top_k=3,
            filters=RetrievalFilters(document_id=doc_id)
        )
        s_res = await search_chunks(s_req)

        top_chunk = s_res.data.results[0] if s_res.data and s_res.data.results else None
        top_sec = top_chunk.section_number if top_chunk else None
        top_title = top_chunk.section_title if top_chunk else None
        sim = top_chunk.similarity_score if top_chunk else 0.0

        is_hit = (top_sec == exp_sec) or (exp_title.lower() in (top_title or "").lower())
        if is_hit:
            retrieval_hits += 1
            top1_section_hits += 1

        # 2. Evaluate Ask Your Documents (RAG)
        ask_req = AskRequest(question=qtext, top_k=3)
        try:
            ask_res = await process_ask(ask_req, db=db, current_user=admin_user)
            answer_snippet = (ask_res.answer[:90] + "...") if ask_res.answer else "No answer"
            citations_count = len(ask_res.citations)
            top_cit = f"p.{ask_res.citations[0].page_start}" if ask_res.citations else "N/A"
        except Exception as e:
            answer_snippet = f"RAG Error: {e}"
            citations_count = 0
            top_cit = "Error"

        status_flag = "PASS" if is_hit else "MISS"
        print(f"[{qid:02d}] {status_flag} | Q: '{qtext}'")
        print(f"     Expected Sec #{exp_sec} ({exp_title}) -> Retrieved Sec #{top_sec} ({top_title}) | Sim: {sim:.3f}")
        print(f"     Answer: {answer_snippet} (Citations: {citations_count}, Top: {top_cit})\n")

        results_summary.append({
            "qid": qid,
            "question": qtext,
            "expected_sec": exp_sec,
            "retrieved_sec": top_sec,
            "retrieved_title": top_title,
            "similarity": sim,
            "hit": is_hit,
            "citations": citations_count
        })

    accuracy = (retrieval_hits / total_q) * 100.0
    print("=" * 80)
    print(f"EVALUATION COMPLETE: {retrieval_hits}/{total_q} Top-1 Accuracy ({accuracy:.1f}%)")
    print("=" * 80)

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_eval())
