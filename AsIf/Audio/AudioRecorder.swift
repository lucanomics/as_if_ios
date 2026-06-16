import Foundation
import AVFoundation
import Combine

/// AVFoundation-based recorder for capturing the learner's spoken answers.
///
/// Responsibilities for the MVP:
/// - request microphone permission
/// - start / stop recording
/// - expose the temporary local file URL of each recording
///
/// No speech-to-text and no upload happen here — recordings stay on-device in
/// the temporary directory.
@MainActor
final class AudioRecorder: NSObject, ObservableObject {

    enum PermissionState {
        case undetermined
        case granted
        case denied
    }

    @Published private(set) var isRecording = false
    @Published private(set) var permission: PermissionState = .undetermined
    /// Elapsed seconds of the in-progress recording.
    @Published private(set) var elapsed: TimeInterval = 0
    /// Normalized input level 0...1 for a live meter.
    @Published private(set) var level: CGFloat = 0

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private var currentURL: URL?

    override init() {
        super.init()
        refreshPermissionState()
    }

    // MARK: - Permission

    func refreshPermissionState() {
        switch AVAudioApplication.shared.recordPermission {
        case .granted: permission = .granted
        case .denied: permission = .denied
        case .undetermined: permission = .undetermined
        @unknown default: permission = .undetermined
        }
    }

    /// Requests microphone access. Returns whether it was granted.
    @discardableResult
    func requestPermission() async -> Bool {
        let granted = await AVAudioApplication.requestRecordPermission()
        permission = granted ? .granted : .denied
        return granted
    }

    // MARK: - Recording

    /// Begins recording into a fresh temporary file. Returns the URL being written.
    @discardableResult
    func startRecording() -> URL? {
        guard !isRecording else { return currentURL }

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
        } catch {
            return nil
        }

        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("asif-\(UUID().uuidString)")
            .appendingPathExtension("m4a")

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            let recorder = try AVAudioRecorder(url: url, settings: settings)
            recorder.delegate = self
            recorder.isMeteringEnabled = true
            guard recorder.record() else { return nil }
            self.recorder = recorder
            self.currentURL = url
            self.isRecording = true
            self.elapsed = 0
            startTimer()
            return url
        } catch {
            return nil
        }
    }

    /// Stops recording and returns the saved temporary file URL, if any.
    @discardableResult
    func stopRecording() -> URL? {
        guard isRecording else { return currentURL }
        recorder?.stop()
        recorder = nil
        stopTimer()
        isRecording = false
        level = 0
        try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
        return currentURL
    }

    // MARK: - Metering

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.tick() }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func tick() {
        guard let recorder, recorder.isRecording else { return }
        elapsed = recorder.currentTime
        recorder.updateMeters()
        // Convert dBFS (-160...0) into a smoothed 0...1 level.
        let power = recorder.averagePower(forChannel: 0)
        let normalized = max(0, (power + 50) / 50)
        level = level * 0.7 + CGFloat(normalized) * 0.3
    }

    deinit {
        timer?.invalidate()
    }
}

extension AudioRecorder: AVAudioRecorderDelegate {
    nonisolated func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        // Cleanup handled in stopRecording(); nothing further required for the MVP.
    }
}
