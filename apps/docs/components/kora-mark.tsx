/** kora-ui's mark: the owner's K in Istmo Code green. Same shape as app/icon.svg and public/mark.svg. */
export function KoraMark({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="120 105 290 290" className="kora-mark">
      <path d="M135 135C135 123 143 115 155 115H215C227 115 235 123 235 135V208C272 192 296 164 306 125C309 117 315 115 324 115H395C382 192 336 242 255 245C247 246 240 248 235 250C240 252 247 254 255 255C336 258 382 308 395 385H324C315 385 309 383 306 375C296 336 272 308 235 292V365C235 377 227 385 215 385H155C143 385 135 377 135 365Z" />
    </svg>
  );
}
