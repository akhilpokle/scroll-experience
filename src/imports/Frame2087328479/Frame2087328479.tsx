export default function Frame() {
  return (
    <div className="bg-[#000] font-['Bricolage_Grotesque:Regular',sans-serif] font-normal leading-[normal] relative size-full text-white whitespace-nowrap">
      <p className="absolute left-[calc(50%-142px)] text-[32px] top-[calc(50%-62px)]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
        Hello Timothy Tan!
      </p>
      <p className="absolute left-[calc(50%-326px)] text-[48px] top-[calc(50%+1px)]" style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}>
        We wanted to say Thank you!
      </p>
    </div>
  );
}