import SwiftUI

/// The core of the pressure loop: step through each round, hold and record a
/// spoken answer, then move to the debrief. Recording is real (AVFoundation);
/// if the mic is unavailable the flow still completes without it.
struct PracticeSessionView: View {
    let scenario: Scenario

    @Environment(\.dismiss) private var dismiss
    @StateObject private var recorder = AudioRecorder()

    @State private var promptIndex = 0
    @State private var session: PracticeSession
    @State private var feedback: PracticeFeedback?
    @State private var showMicDeniedAlert = false
    @State private var pulse = false

    private let prompts: [DialogueTurn]

    init(scenario: Scenario) {
        self.scenario = scenario
        self.prompts = scenario.prompts
        _session = State(initialValue: PracticeSession(scenarioID: scenario.id))
    }

    private var currentPrompt: DialogueTurn { prompts[promptIndex] }
    private var isLastPrompt: Bool { promptIndex == prompts.count - 1 }

    var body: some View {
        ZStack {
            // The backdrop intensifies to a red glow while recording.
            ScreenBackground(glowColor: recorder.isRecording ? Theme.Color.danger : Theme.Color.accent)
                .animation(.easeInOut(duration: 0.4), value: recorder.isRecording)

            VStack(spacing: 0) {
                topBar
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        promptCard
                        if let hint = currentPrompt.hint {
                            hintCard(hint)
                        }
                    }
                    .padding(.horizontal, Theme.Layout.screenPadding)
                    .padding(.top, Theme.Spacing.xl)
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
            Text("You can still run through the rounds, but answers won't be recorded. Enable the microphone in Settings to capture your voice.")
        }
    }

    // MARK: - Top bar

    private var topBar: some View {
        VStack(spacing: Theme.Spacing.md) {
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

                VStack(spacing: 2) {
                    Text("ROUND \(promptIndex + 1) / \(prompts.count)")
                        .font(Theme.Font.mono(12))
                        .tracking(1.4)
                        .foregroundStyle(Theme.Color.textPrimary)
                    Text(scenario.title)
                        .font(Theme.Font.caption(12))
                        .foregroundStyle(Theme.Color.textTertiary)
                }

                Spacer()

                // Balance the close button so the title stays centered.
                Color.clear.frame(width: 38, height: 38)
            }

            // Segmented round progress.
            HStack(spacing: 6) {
                ForEach(prompts.indices, id: \.self) { i in
                    Capsule()
                        .fill(segmentColor(for: i))
                        .frame(height: 5)
                        .animation(.easeInOut(duration: 0.3), value: promptIndex)
                }
            }
        }
        .padding(.horizontal, Theme.Layout.screenPadding)
        .padding(.top, 8)
    }

    private func segmentColor(for i: Int) -> Color {
        if i < promptIndex { return Theme.Color.accent }
        if i == promptIndex { return Theme.Color.accent.opacity(0.55) }
        return Theme.Color.surfaceElevated
    }

    // MARK: - Content

    private var promptCard: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(spacing: 10) {
                Image(systemName: "person.fill.viewfinder")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Theme.Color.accent)
                Text(officialRole.uppercased())
                    .font(Theme.Font.mono(11))
                    .tracking(1.4)
                    .foregroundStyle(Theme.Color.textTertiary)
                Spacer()
                Text("SAYS")
                    .font(Theme.Font.mono(10))
                    .tracking(1.6)
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
        .overlay(alignment: .leading) {
            // Accent spine for a sharp, dossier-like edge.
            RoundedRectangle(cornerRadius: 2, style: .continuous)
                .fill(Theme.Gradient.accent)
                .frame(width: 3)
                .padding(.vertical, 22)
        }
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
        VStack(spacing: Theme.Spacing.md) {
            if recorder.isRecording {
                liveMeter
            } else {
                Text("Hold your answer, then speak it out loud.")
                    .font(Theme.Font.caption(14))
                    .foregroundStyle(Theme.Color.textTertiary)
                    .frame(height: 48)
            }

            recordButton

            Text(recorder.isRecording
                 ? "Tap to lock in this answer"
                 : (isLastPrompt ? "Final round" : "\(prompts.count - promptIndex - 1) rounds after this"))
                .font(Theme.Font.caption(12))
                .foregroundStyle(Theme.Color.textTertiary)
        }
        .padding(.horizontal, Theme.Layout.screenPadding)
        .padding(.top, Theme.Spacing.md)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity)
        .background(
            Theme.Color.background
                .overlay(Rectangle().fill(Theme.Color.stroke).frame(height: 1), alignment: .top)
        )
    }

    private var liveMeter: some View {
        VStack(spacing: 10) {
            HStack(spacing: 8) {
                Circle()
                    .fill(Theme.Color.danger)
                    .frame(width: 8, height: 8)
                    .opacity(pulse ? 0.35 : 1)
                Text("REC")
                    .font(Theme.Font.mono(11))
                    .tracking(1.6)
                    .foregroundStyle(Theme.Color.danger)
                Text(timeString(recorder.elapsed))
                    .font(Theme.Font.mono(15))
                    .foregroundStyle(Theme.Color.textPrimary)
            }

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
                // Pulsing halo while recording.
                if recorder.isRecording {
                    Circle()
                        .stroke(Theme.Color.danger.opacity(0.5), lineWidth: 2)
                        .frame(width: 78, height: 78)
                        .scaleEffect(pulse ? 1.35 : 1)
                        .opacity(pulse ? 0 : 1)
                }

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
        .onChange(of: recorder.isRecording) { _, recording in
            if recording {
                pulse = false
                withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: false)) {
                    pulse = true
                }
            } else {
                withAnimation(.default) { pulse = false }
            }
        }
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
