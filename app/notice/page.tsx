export default function NoticePage() {
  return (
    <div>
      <p className='text-2xl font-bold underline underline-offset-4 decoration-[#4C71C0]'>
        공지사항
      </p>

      <div className='mt-8'>
        <section>
          <p className='text-lg font-bold mb-2'>💡 FIT-career는 무슨 서비스인가요?</p>

          <p className='text-base text-gray-700 break-keep mb-2'>
            피트니스 업계의 흩어져 있는 채용공고, 대회정보, 중고거래, 운동정보, 영양정보 등을 한
            곳에 모아 정보를 제공하여 현재 업계의 불편함을 해소하고자 하는 서비스 입니다.
          </p>

          <ol className='list-decimal list-inside text-gray-700 mb-4 break-keep'>
            <li>
              채용 정보 및 이력서 관리: 무분별한 도배글과 낮은 품질의 채용정보 문제를 해결합니다.
              피트니스 기업은 채용 공고를 쉽게 등록 및 관리할 수 있고, 구직자는 편리하게 채용 정보를
              확인할 수 있습니다.
            </li>
            <li>
              코치 프로필 등록: 코치 개인이 프로필을 등록하여 채용중인 기업 또는 개인에게 제안을
              받을 수 있습니다.
            </li>
            <li>
              카드뉴스 콘텐츠 제공: 양질의 정보를 한곳에 모아 피트니스 관련 콘텐츠를 제공하여 커리어
              성장에 도움을 줍니다.
            </li>
            <li>
              피트니스 커뮤니티: SNS 기능을 통해 피트니스에 관심이 있는 사람들과 소통할 수 있습니다.
            </li>
            <li>
              중고 거래 정보 관리: 형성된 커뮤니티를 기반으로 중고 거래 정보를 한곳에서 쉽고
              편리하게 관리할 수 있습니다.
            </li>
            <li>
              대회 일정 및 정보 제공: 흩어져 있는 대회 일정 및 정보를 한눈에 볼 수 있도록
              제공합니다.
            </li>
          </ol>
        </section>

        <section className='mt-8'>
          <p className='text-lg font-bold mb-2'>📱 FIT-career가 제공하는 기능</p>

          <p className='text-base text-gray-700 break-keep mb-2'>
            현재 제공되는 기능은 모두 <strong>무료</strong>입니다.
          </p>

          <ul className='list-disc list-inside text-gray-700 break-keep'>
            <li>🎯 채용 공고 등록 및 관리</li>
            <li>👥 구직자 이력서 등록 및 관리</li>
            <li>👨‍🏫 코치 프로필 등록 및 관리 (개발중)</li>
            <li>📰 카드뉴스 컨텐츠 제공 (개발중)</li>
            <li>👍 피트니스 커뮤니티 (예정)</li>
            <li>👫 중고 거래 커뮤니티 (예정)</li>
            <li>🥇 대회 일정 및 정보 제공 (예정)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
