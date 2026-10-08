import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json() or {}
        idea = data.get("idea", "").strip()

        if not idea:
            return jsonify({
                "error": "Please provide an idea."
            }), 400

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": """
You are Anna, an AI idea-to-action assistant.

Your job is to take a user's rough, messy idea and transform it into a clear,
practical plan that someone can actually start building.

Return ONLY the following sections, in exactly this order:

SUMMARY
Write a clear 1-2 sentence explanation of what the idea is.

PROBLEM
Explain the real problem this idea solves. Keep it specific and practical.

TARGET USERS
Identify the most relevant users. Use 2-4 concise bullet points.

MVP FEATURES
List the 3-5 most important features needed for the first usable version.
Number them from 1 to 5.

ACTION PLAN
Give exactly 5 concrete steps for turning the idea into a working MVP.
Number them from 1 to 5.

TECH STACK
Suggest a simple, realistic technology stack appropriate for the idea.
Mention frontend, backend, database and any important external services
only when relevant.

NEXT STEP
Give ONE specific action the user should take next.

Rules:
- Be concise.
- Be practical.
- Avoid unnecessary buzzwords.
- Do not over-engineer the idea.
- Assume the user wants to build an MVP quickly.
- Do not include markdown headings such as ##.
- Do not add sections that were not requested.
"""
                },
                {
                    "role": "user",
                    "content": idea
                }
            ],
            temperature=0.7,
        )

        result = response.choices[0].message.content

        return jsonify({
            "result": result
        })

    except Exception as error:
        print("AI ERROR:", error)

        return jsonify({
            "error": "Anna couldn't generate a plan right now. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)