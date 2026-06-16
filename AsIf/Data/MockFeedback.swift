import Foundation

/// Generates mock `PracticeFeedback` for a completed session.
///
/// This is a placeholder for real evaluation. There is no speech-to-text and no
/// AI here — the result is composed locally from the scenario and a seeded
/// pseudo-random draw so the same session always yields the same feedback.
enum MockFeedbackEngine {

    static func evaluate(scenario: Scenario, session: PracticeSession) -> PracticeFeedback {
        // Seed from stable inputs so results are deterministic per session.
        var seed = UInt64(truncatingIfNeeded: scenario.id.hashValue ^ session.id.hashValue)
        if seed == 0 { seed = 0x9E3779B97F4A7C15 } // xorshift must not start at zero
        func next(_ lower: Int, _ upper: Int) -> Int {
            // Simple xorshift for repeatable variety without Foundation's RNG.
            seed ^= seed << 13
            seed ^= seed >> 7
            seed ^= seed << 17
            return lower + Int(seed % UInt64(upper - lower + 1))
        }

        let clarity = next(64, 92)
        let composure = next(58, 95)
        let fluency = next(60, 90)
        let relevance = next(66, 94)
        let overall = (clarity + composure + fluency + relevance) / 4

        let metrics = [
            PracticeFeedback.Metric(name: "Clarity", value: clarity),
            PracticeFeedback.Metric(name: "Composure", value: composure),
            PracticeFeedback.Metric(name: "Fluency", value: fluency),
            PracticeFeedback.Metric(name: "Relevance", value: relevance)
        ]

        let headline: String
        switch overall {
        case 85...: headline = "You held the line."
        case 72..<85: headline = "Solid — with sharp edges to file down."
        default: headline = "You got through it. Now tighten it up."
        }

        let summary = "You completed \(session.recordingURLs.count) of \(scenario.prompts.count) responses in “\(scenario.title).” " + composureNote(composure) + " " + relevanceNote(relevance)

        return PracticeFeedback(
            overallScore: overall,
            headline: headline,
            summary: summary,
            metrics: metrics,
            strengths: strengths(for: scenario, composure: composure, clarity: clarity),
            improvements: improvements(for: scenario, fluency: fluency, relevance: relevance),
            suggestedLine: suggestedLine(for: scenario)
        )
    }

    // MARK: - Copy builders

    private static func composureNote(_ value: Int) -> String {
        value >= 80
            ? "You stayed composed even when the questions came quickly."
            : "You wavered a little when the pressure rose — that's the muscle to train."
    }

    private static func relevanceNote(_ value: Int) -> String {
        value >= 80
            ? "Your answers stayed on point."
            : "A couple of answers drifted past what was actually asked."
    }

    private static func strengths(for scenario: Scenario, composure: Int, clarity: Int) -> [String] {
        var items: [String] = []
        if clarity >= 75 { items.append("Clear pronunciation and easy-to-follow phrasing.") }
        if composure >= 75 { items.append("Steady tone — you didn't sound rattled.") }
        items.append("You engaged with every prompt instead of freezing.")
        switch scenario.category {
        case .immigration: items.append("Your answers were consistent across repeated questions.")
        case .law: items.append("You kept a respectful, non-confrontational register.")
        case .medical: items.append("You described symptoms in a logical order.")
        case .court: items.append("You stuck to what you actually knew.")
        case .everyday: items.append("You kept the exchange moving naturally.")
        }
        return Array(items.prefix(3))
    }

    private static func improvements(for scenario: Scenario, fluency: Int, relevance: Int) -> [String] {
        var items: [String] = []
        if fluency < 80 { items.append("Reduce filler pauses — commit to the first few words faster.") }
        if relevance < 80 { items.append("Answer the exact question before adding extra detail.") }
        switch scenario.category {
        case .immigration: items.append("Lead with the single clearest reason, then stop.")
        case .law: items.append("Narrate your actions before you move — it lowers tension.")
        case .medical: items.append("Anchor each symptom to a specific time and intensity.")
        case .court: items.append("Don't accept a leading premise — correct it, briefly.")
        case .everyday: items.append("Use a natural clarifier like “sorry, one more time?” instead of going quiet.")
        }
        return Array(items.prefix(3))
    }

    private static func suggestedLine(for scenario: Scenario) -> String {
        switch scenario.category {
        case .immigration:
            return "“I'm here for one week of meetings with a client, then flying home Sunday.”"
        case .law:
            return "“My license is in my wallet and the registration is in the glovebox — I'm going to reach for them now.”"
        case .medical:
            return "“Sharp chest pain that started about two hours ago, around a seven, worse when I breathe in.”"
        case .court:
            return "“I can't answer that as a simple yes or no without it being misleading — may I explain?”"
        case .everyday:
            return "“Sorry, you lost me at the alley — left at the what?”"
        }
    }
}
