import SwiftUI

/// The core of the pressure loop: step through each prompt, record a spoken
/// answer, then move to the mock result.
struct PracticeSessionView: View {
    let scenario: Scenario

    @Environment(\.dismiss) private var dismiss
    @StateObject private var recorder = AudioRecorder()

    @State private var promptIndex = 0
    @State private var session: PracticeSession
    @State private var feedback: PracticeFeedback?
    @State private var showMicDeniedAlert = false

    private let prompts: [DialogueTurn]

    init(scenario: Scenario) {
        self.scenario = scenario
        self.prompts = scenario.prompts
        _session = State(initialValue: PracticeSession(scenarioID: scenario.id))
    }

    private var currentPrompt: DialogueTurn { prompts[promptIndex] }
    private var isLastPrompt: Bool { promptIndex == prompts.count - 1 }
    private var progress: Double { Double(promptIndex) / Double(max(prompts.count, 1)) }

    var body: some View {
        ZStack {
            Theme.Color.background.ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                ScrollView {
                    VStack(alignment: .leading, spacing: 28) {
                        promptCard
                        if let hint = currentPrompt.hint {
                            hintCard(hint)
                        }
                    }
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.top, 28)
                }
                recordingControls
            }
        }
        .task {
            if recorder.permission == .undetermined {
                await recorder.requestPermission()
            }
        }
        .fullScreenCover(item: $feedback) { result in
            ResultView(scenario: scenario, feedback: result) {
                // Dismiss both the result and the session back to detail.
                feedback = nil
                dismiss()
            }
        }
        .alert("Microphone access is off", isPresented: $showMicDeniedAlert) {
            Button("Continue without recording", role: .cancel) { advance(savedURL: nil) }
        } message: {
            Text("You can still run through the prompts, but answers won't be recorded. Enable the microphone in Settings to capture your voice.")
        }
    }

    // MARK: - Top bar

    private var topBar: some View {
        VStack(spacing: 16) {
            HStack {
                Button {
                    if recorder.isRecording { _ = recorder.stopRecording() }
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.Color.textSecondary)
                        .frame(width: 38, height: 38)
                        .background(Circle().fill(Theme.Color.surface))
                }

                Spacer()

                Text(scenario.title)
                    .font(Theme.Font.caption(14))
                    .foregroundStyle(Theme.Color.textSecondary)

                Spacer()

                Text("\(promptIndex + 1) / \(prompts.count)")
                    .font(Theme.Font.mono(13))
                    .foregroundStyle(Theme.Color.textTertiary)
                    .frame(width: 38)
            }

            // Progress track
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.Color.surface)
                    Capsule()
                        .fill(Theme.Color.accent)
                        .frame(width: max(6, geo.size.width * progress))
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: 5)
        }
        .padding(.horizontal, Theme.Layout.screenPadding)
        .padding(.top, 8)
    }

    // MARK: - Content

    private var promptCard: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 10) {
                Image(systemName: "person.fill.questionmark")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.Color.accent)
                Text(officialRole.uppercased())
                    .font(Theme.Font.mono(11))
                    .tracking(1.4)
                    .foregroundStyle(Theme.Color.textTertiary)
            }

            Text("“\(currentPrompt.text)”")
                .font(Theme.Font.display(28))
                .foregroundStyle(Theme.Color.textPrimary)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .fill(Theme.Color.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Layout.cardRadius, style: .continuous)
                .stroke(Theme.Color.stroke, lineWidth: 1)
        )
    }

    private func hintCard(_ hint: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "lightbulb.fill")
                .font(.system(size: 13))
                .foregroundStyle(Theme.Color.warning)
            Text(hint)
                .font(Theme.Font.body(14))
                .foregroundStyle(Theme.Color.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineSpacing(2)
            Spacer(minLength: 0)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: Theme.Layout.controlRadius, style: .continuous)
                .fill(Theme.Color.warning.opacity(0.08))
        )
    }

    private var officialRole: String {
        switch scenario.category {
        case .immigration: return "Immigration Officer"
        case .law: return "Police Officer"
        case .medical: return "Triage Nurse"
        case .court: return "Prosecutor"
        case .everyday: return "Local"
        }
    }

    // MARK: - Recording controls

    private var recordingControls: some View {
        VStack(spacing: 18) {
            if recorder.isRecording {
                liveMeter
            } else {
                Text("When you're ready, tap to answer out loud.")
                    .font(Theme.Font.caption(14))
                    .foregroundStyle(Theme.Color.textTertiary)
                    .frame(height: 44)
            }

            recordButton

            Text(recorder.isRecording
                 ? "Tap again to finish this answer"
                 : (isLastPrompt ? "Last question" : "\(prompts.count - promptIndex - 1) more after this"))
                .font(Theme.Font.caption(12))
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .padding(.horizontal, Theme.Layout.screenPadding)
        .padding(.top, 16)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity)
        .background(
            Theme.Color.background
                .overlay(Rectangle().fill(Theme.Color.stroke).frame(height: 1), alignment: .top)
        )
    }

    private var liveMeter: some View {
        VStack(spacing: 10) {
            Text(timeString(recorder.elapsed))
                .font(Theme.Font.mono(15))
                .foregroundStyle(Theme.Color.textPrimary)

            HStack(spacing: 4) {
                ForEach(0..<24, id: \.self) { i in
                    Capsule()
                        .fill(barColor(for: i))
                        .frame(width: 4, height: barHeight(for: i))
                }
            }
            .frame(height: 44)
            .animation(.easeOut(duration: 0.08), value: recorder.level)
        }
    }

    private var recordButton: some View {
        Button {
            handleRecordTap()
        } label: {
            ZStack {
                Circle()
                    .fill(recorder.isRecording ? Theme.Color.danger : Theme.Color.accent)
                    .frame(width: 78, height: 78)
                    .shadow(color: (recorder.isRecording ? Theme.Color.danger : Theme.Color.accent).opacity(0.45),
                            radius: 18, y: 6)

                if recorder.isRecording {
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(.white)
                        .frame(width: 26, height: 26)
                } else {
                    Image(systemName: "mic.fill")
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(.white)
                }
            }
        }
        .buttonStyle(.plain)
    }

    // MARK: - Actions

    private func handleRecordTap() {
        if recorder.isRecording {
            let url = recorder.stopRecording()
            advance(savedURL: url)
            return
        }

        switch recorder.permission {
        case .granted:
            recorder.startRecording()
        case .denied:
            showMicDeniedAlert = true
        case .undetermined:
            Task {
                let granted = await recorder.requestPermission()
                if granted { recorder.startRecording() } else { showMicDeniedAlert = true }
            }
        }
    }

    private func advance(savedURL: URL?) {
        if let savedURL { session.recordingURLs.append(savedURL) }

        if isLastPrompt {
            feedback = MockFeedbackEngine.evaluate(scenario: scenario, session: session)
        } else {
            withAnimation(.easeInOut(duration: 0.25)) { promptIndex += 1 }
        }
    }

    // MARK: - Meter helpers

    private func barHeight(for index: Int) -> CGFloat {
        // Distance from the center bars drives a symmetric, lively meter.
        let center = 11.5
        let distance = abs(Double(index) - center) / center
        let base = 6.0
        let reach = 38.0 * (1.0 - distance * 0.65)
        return CGFloat(base + reach * Double(recorder.level))
    }

    private func barColor(for index: Int) -> Color {
        let threshold = CGFloat(index) / 24.0
        return recorder.level > threshold * 0.9 ? Theme.Color.accent : Theme.Color.surfaceElevated
    }

    private func timeString(_ t: TimeInterval) -> String {
        let total = Int(t)
        return String(format: "%01d:%02d", total / 60, total % 60)
    }
}

#Preview {
    PracticeSessionView(scenario: ScenarioData.policeStop)
}
