import Foundation
import SwiftUI

// MARK: - Scenario

/// A high-stakes situation the learner can practice.
struct Scenario: Identifiable, Hashable {
    let id: UUID
    let title: String
    let category: Category
    /// One-line hook shown in the library.
    let tagline: String
    /// Longer framing shown on the detail screen.
    let summary: String
    let difficulty: Difficulty
    /// Approximate length of a run, in minutes.
    let estimatedMinutes: Int
    /// SF Symbol used as the scenario glyph.
    let symbol: String
    /// What the learner is being judged on in this situation.
    let pressurePoints: [String]
    /// The scripted exchange that drives the practice session.
    let script: [DialogueTurn]

    init(
        id: UUID = UUID(),
        title: String,
        category: Category,
        tagline: String,
        summary: String,
        difficulty: Difficulty,
        estimatedMinutes: Int,
        symbol: String,
        pressurePoints: [String],
        script: [DialogueTurn]
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.tagline = tagline
        self.summary = summary
        self.difficulty = difficulty
        self.estimatedMinutes = estimatedMinutes
        self.symbol = symbol
        self.pressurePoints = pressurePoints
        self.script = script
    }

    /// The official's prompts — the turns the learner must respond to.
    var prompts: [DialogueTurn] { script.filter { $0.speaker == .official } }
}

extension Scenario {
    enum Category: String, CaseIterable {
        case immigration = "Immigration"
        case law = "Law & Order"
        case medical = "Medical"
        case court = "Courtroom"
        case everyday = "Everyday"
    }

    enum Difficulty: Int, Comparable {
        case intermediate = 1
        case advanced = 2
        case intense = 3

        var label: String {
            switch self {
            case .intermediate: return "Intermediate"
            case .advanced: return "Advanced"
            case .intense: return "Intense"
            }
        }

        var tint: Color {
            switch self {
            case .intermediate: return Theme.Color.success
            case .advanced: return Theme.Color.warning
            case .intense: return Theme.Color.danger
            }
        }

        static func < (lhs: Difficulty, rhs: Difficulty) -> Bool {
            lhs.rawValue < rhs.rawValue
        }
    }
}

// MARK: - DialogueTurn

/// A single line in a scenario's scripted exchange.
struct DialogueTurn: Identifiable, Hashable {
    let id: UUID
    let speaker: Speaker
    let text: String
    /// Optional coaching hint shown to the learner before they answer.
    let hint: String?

    init(id: UUID = UUID(), speaker: Speaker, text: String, hint: String? = nil) {
        self.id = id
        self.speaker = speaker
        self.text = text
        self.hint = hint
    }

    enum Speaker: Hashable {
        /// The pressure source — officer, doctor, prosecutor, local.
        case official
        /// The learner.
        case you
    }
}

// MARK: - PracticeSession

/// A single attempt at a scenario. Holds the recordings captured per prompt.
struct PracticeSession: Identifiable {
    let id: UUID
    let scenarioID: UUID
    let startedAt: Date
    /// Local file URLs of each recorded answer, in prompt order.
    var recordingURLs: [URL]

    init(
        id: UUID = UUID(),
        scenarioID: UUID,
        startedAt: Date = .now,
        recordingURLs: [URL] = []
    ) {
        self.id = id
        self.scenarioID = scenarioID
        self.startedAt = startedAt
        self.recordingURLs = recordingURLs
    }
}

// MARK: - PracticeFeedback

/// Mock evaluation of a completed session. No real AI is used yet — these
/// values are generated locally to demonstrate the result experience.
struct PracticeFeedback: Identifiable {
    let id: UUID
    /// Overall score, 0–100.
    let overallScore: Int
    let headline: String
    let summary: String
    let metrics: [Metric]
    let strengths: [String]
    let improvements: [String]
    /// A sharper way the learner could have answered.
    let suggestedLine: String

    init(
        id: UUID = UUID(),
        overallScore: Int,
        headline: String,
        summary: String,
        metrics: [Metric],
        strengths: [String],
        improvements: [String],
        suggestedLine: String
    ) {
        self.id = id
        self.overallScore = overallScore
        self.headline = headline
        self.summary = summary
        self.metrics = metrics
        self.strengths = strengths
        self.improvements = improvements
        self.suggestedLine = suggestedLine
    }

    struct Metric: Identifiable {
        let id = UUID()
        let name: String
        /// 0–100.
        let value: Int
    }

    var grade: String {
        switch overallScore {
        case 90...: return "A"
        case 80..<90: return "B"
        case 70..<80: return "C"
        case 60..<70: return "D"
        default: return "E"
        }
    }
}
