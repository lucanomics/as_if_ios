import Foundation

/// Local, hand-written mock content for the Pressure Loop MVP.
/// Everything here is static sample data — no network, no backend.
enum ScenarioData {

    static let all: [Scenario] = [
        airportImmigration,
        policeStop,
        erIntake,
        courtroom,
        streetTalk
    ]

    // MARK: 1 — Airport Immigration

    static let airportImmigration = Scenario(
        title: "Secondary Inspection",
        category: .immigration,
        tagline: "You've been pulled aside. Stay calm, stay consistent.",
        summary: "An immigration officer has sent you to secondary inspection. The questions are fast and repetitive, and small inconsistencies get noticed. Your job is to answer clearly, confidently, and without contradicting yourself.",
        difficulty: .advanced,
        estimatedMinutes: 4,
        symbol: "airplane.departure",
        pressurePoints: [
            "Keep your story consistent under repetition",
            "Give specific details without rambling",
            "Stay composed when pressed"
        ],
        script: [
            DialogueTurn(speaker: .official,
                         text: "What is the purpose of your visit?",
                         hint: "Be specific and brief — one clear reason."),
            DialogueTurn(speaker: .official,
                         text: "How long do you plan to stay, and where?",
                         hint: "Give an exact duration and the city or address."),
            DialogueTurn(speaker: .official,
                         text: "Who are you visiting, and how do you know them?",
                         hint: "Name the relationship plainly. Don't over-explain."),
            DialogueTurn(speaker: .official,
                         text: "You said business earlier. Which is it — business or visiting friends?",
                         hint: "Stay consistent. Reconcile it calmly without sounding defensive.")
        ]
    )

    // MARK: 2 — Police Stop

    static let policeStop = Scenario(
        title: "License and Registration",
        category: .law,
        tagline: "Flashing lights behind you. Keep it short and respectful.",
        summary: "You've been pulled over on a quiet road at night. The officer is direct. The goal is to respond respectfully, provide what's asked, and avoid escalating — while still being clear about what you know.",
        difficulty: .intense,
        estimatedMinutes: 3,
        symbol: "car.fill",
        pressurePoints: [
            "Stay calm and non-confrontational",
            "Answer only what is asked",
            "Be clear about what you're doing and reaching for"
        ],
        script: [
            DialogueTurn(speaker: .official,
                         text: "Do you know why I pulled you over tonight?",
                         hint: "A short, honest answer is best. Don't guess wildly."),
            DialogueTurn(speaker: .official,
                         text: "License and registration, please.",
                         hint: "Say where the documents are before you reach for them."),
            DialogueTurn(speaker: .official,
                         text: "Where are you coming from this late?",
                         hint: "Keep it simple and truthful."),
            DialogueTurn(speaker: .official,
                         text: "Have you had anything to drink tonight?",
                         hint: "Answer directly and calmly.")
        ]
    )

    // MARK: 3 — ER Intake

    static let erIntake = Scenario(
        title: "Describe Your Symptoms",
        category: .medical,
        tagline: "The triage nurse needs the facts. Fast and accurate.",
        summary: "You're at the emergency room intake desk. A triage nurse needs a precise picture quickly. The goal is to describe what's wrong with the right detail — onset, location, intensity — so you're seen appropriately.",
        difficulty: .intermediate,
        estimatedMinutes: 4,
        symbol: "cross.case.fill",
        pressurePoints: [
            "Describe symptoms precisely and in order",
            "Use clear time and intensity references",
            "Answer follow-ups without losing the thread"
        ],
        script: [
            DialogueTurn(speaker: .official,
                         text: "What brings you in today?",
                         hint: "Lead with the main problem in one sentence."),
            DialogueTurn(speaker: .official,
                         text: "When did it start, and has it gotten worse?",
                         hint: "Give a clear timeline — hours, days — and the trend."),
            DialogueTurn(speaker: .official,
                         text: "On a scale of one to ten, how bad is the pain right now?",
                         hint: "Pick a number and describe what it stops you from doing."),
            DialogueTurn(speaker: .official,
                         text: "Any medications, allergies, or conditions I should know about?",
                         hint: "List them plainly. Say 'none' clearly if that's the case.")
        ]
    )

    // MARK: 4 — Courtroom

    static let courtroom = Scenario(
        title: "Answer Under Pressure",
        category: .court,
        tagline: "You're on the stand. Every word is on the record.",
        summary: "You are being questioned as a witness. The attorney is probing for inconsistencies and pushing for quick reactions. The goal is to answer truthfully, precisely, and only the question asked — without being rattled.",
        difficulty: .intense,
        estimatedMinutes: 5,
        symbol: "building.columns.fill",
        pressurePoints: [
            "Answer only the question asked",
            "Don't let leading questions reshape your answer",
            "Stay measured when pushed for speed"
        ],
        script: [
            DialogueTurn(speaker: .official,
                         text: "Please state, in your own words, what you saw that evening.",
                         hint: "Be factual and chronological. Stick to what you actually saw."),
            DialogueTurn(speaker: .official,
                         text: "Isn't it true that you couldn't have seen clearly from that distance?",
                         hint: "Don't accept the premise if it's wrong. Correct it calmly."),
            DialogueTurn(speaker: .official,
                         text: "Yes or no — were you certain at the time?",
                         hint: "If a yes/no answer would mislead, say so and clarify briefly."),
            DialogueTurn(speaker: .official,
                         text: "So you admit your memory may be unreliable?",
                         hint: "Don't get pulled into their words. Restate the truth plainly.")
        ]
    )

    // MARK: 5 — Street Talk

    static let streetTalk = Scenario(
        title: "Fast Local Conversation",
        category: .everyday,
        tagline: "A local fires off questions at full speed. Keep up.",
        summary: "You stop to ask for directions and end up in a quick, slang-heavy exchange with a local who talks fast and doesn't slow down. The goal is to keep the conversation moving, ask for clarification naturally, and not freeze.",
        difficulty: .intermediate,
        estimatedMinutes: 3,
        symbol: "bubble.left.and.bubble.right.fill",
        pressurePoints: [
            "Keep the conversation flowing without long pauses",
            "Ask for clarification naturally when you miss something",
            "Match a casual, friendly register"
        ],
        script: [
            DialogueTurn(speaker: .official,
                         text: "Hey — you look lost. Where you tryna get to?",
                         hint: "Answer casually and say where you're headed."),
            DialogueTurn(speaker: .official,
                         text: "Oh that's a bit of a walk. You want the quick way or the scenic one?",
                         hint: "Make a choice and react naturally."),
            DialogueTurn(speaker: .official,
                         text: "Cut through the alley, hang a left at the bodega, can't miss it. Got it?",
                         hint: "If you didn't catch it, ask them to repeat part of it."),
            DialogueTurn(speaker: .official,
                         text: "No worries man, happens all the time. You from around here originally?",
                         hint: "Keep it friendly and natural — small talk, not an interview.")
        ]
    )
}
