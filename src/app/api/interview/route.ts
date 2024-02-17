import { NextRequest, NextResponse } from "next/server";

/**
 * Makes a request to Google Gemini for personalized recommendations
 * @param request
 * @param param1
 */
export async function POST(
    request: NextRequest,
    { params }: any,
): Promise<any> {
    const reqJSON = await request.json();

    console.log(reqJSON);

    // generate an API key: https://makersuite.google.com/app/prompts/new_chat
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            {
                error:
                    "Missing API Key in server. Please contact the site administrator.",
            },
            { status: 500 },
        );
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    const GeminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;

    // parse request body, which will be the question
    if (!request.body) {
        return NextResponse.json(
            {
                error: "Missing body",
            },
            { status: 400 },
        );
    }

    // const reqJSON = await request.json();
    // const question = reqJSON.data;

    // build the request object to send
    const RequestBody = {
        contents: [
            {
                parts: reqJSON.messages
            }
        ],
        safetySettings: [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            stopSequences: [
                "}"
            ]
        },
    };

    // send request and get response
    const res = await fetch(GeminiEndpoint, {
        method: "POST",
        body: JSON.stringify(RequestBody),
    });

    const geminiRes = await res.json();

    // console.log(geminiRes);
    let geminiTextArray = null;
    try {
        geminiTextArray = geminiRes.candidates[0].content.parts;
        let geminiText = geminiTextArray[0].text;
        console.log(geminiText);
        // add on a }
        geminiText += "}";
        const nextRes = NextResponse.json(
            geminiText,
            { status: 201 },
        );
        return nextRes;
    } catch (e) {
        console.error(geminiRes);
        console.error(e);
        return NextResponse.json(
            "An error has occurred",
            { status: 201 },
        );
    }
}