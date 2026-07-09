import { useStore } from '../app/store'
import { APP_NAME, APP_SUBTITLE, DEPLOY_NOTICE, FIXED_NOTICE } from '../data/constants'
import { Banner } from './ui'
import { AppLockPanel } from './AppLockPanel'

export function DeployNotice({ onLockNow }: { onLockNow: () => void }) {
  const { loadSampleData, logs } = useStore()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="section-title">설정 · 안내</h2>
        <p className="text-sm text-gray-500">{APP_NAME} — {APP_SUBTITLE}</p>
      </div>

      <Banner tone="danger">{DEPLOY_NOTICE}</Banner>

      <section className="card space-y-2">
        <h3 className="font-semibold">내 데이터는 어디에 저장되나요?</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>데이터는 이 브라우저의 로컬 저장소에만 저장됩니다.</li>
          <li>Vercel 서버에는 업무기록이 저장되지 않습니다.</li>
          <li>다른 기기에서 접속하면 기존 기록이 자동으로 보이지 않습니다.</li>
          <li>브라우저 데이터를 삭제하면 기록도 함께 사라질 수 있습니다.</li>
          <li>공용 PC에서 사용하지 마세요.</li>
          <li>외부 클라우드에 백업 파일을 올리지 마세요.</li>
          <li>정기적으로 비식별 여부를 확인하세요.</li>
        </ul>
      </section>

      <section className="card space-y-2">
        <h3 className="font-semibold">저장 금지 정보</h3>
        <p className="text-sm text-gray-600">
          이름, 외국인등록번호, 여권번호, 주민등록번호, 생년월일, 전화번호, 이메일, 주소, 회사명/학교명/학원명
          원문, 예약번호 전체, 접수번호, 실제 번호표 순번, 서류 사진, 전산 화면 캡처, 직원 실명 비난 기록,
          민원인을 특정할 수 있는 상세 서술은 입력하지 마세요.
        </p>
      </section>

      <section className="card space-y-2">
        <h3 className="font-semibold">샘플 데이터</h3>
        <p className="text-sm text-gray-600">개인정보가 없는 샘플 로그를 추가해 기능을 확인할 수 있습니다. (현재 {logs.length}건)</p>
        <button className="btn-ghost" onClick={loadSampleData}>샘플 로그 추가</button>
      </section>

      <AppLockPanel onLockNow={onLockNow} />

      <Banner tone="info">{FIXED_NOTICE}</Banner>
    </div>
  )
}
