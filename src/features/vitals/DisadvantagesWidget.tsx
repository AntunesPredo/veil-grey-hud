import { useCharacterStore } from "../character/store";

export function DisadvantagesWidget() {
  const disadvantages = useCharacterStore((state) => state.disadvantages);

  if (!disadvantages || disadvantages.length === 0) return null;
  const firstRow = disadvantages.slice(0, 2);
  const secondRow = disadvantages.slice(2, 4);

  return (
    <div className="flex flex-col relative">
      <div className="flex min-h-[80px]">
        {firstRow.map((flaw) => (
          <div
            key={flaw.id}
            className="flex flex-1 flex-col border-l-2 border-[var(--theme-danger)] px-2 bg-[var(--theme-danger)]/5 py-1"
          >
            <span className="text-[11px] font-black font-mono text-[var(--theme-danger)] uppercase tracking-widest">
              &gt; {flaw.title}
            </span>
            <span className="text-[9px] font-mono text-[var(--theme-text)]/70 leading-tight uppercase mt-0.5">
              {flaw.description}
            </span>
          </div>
        ))}
      </div>
      {secondRow.length ? (
        <div className="flex min-h-[80px] border-t-2 border-[var(--theme-danger)]">
          {secondRow.map((flaw) => (
            <div
              key={flaw.id}
              className="flex flex-1 flex-col border-l-2 border-[var(--theme-danger)] px-2 bg-[var(--theme-danger)]/5 py-1"
            >
              <span className="text-[11px] font-black font-mono text-[var(--theme-danger)] uppercase tracking-widest">
                &gt; {flaw.title}
              </span>
              <span className="text-[9px] font-mono text-[var(--theme-text)]/70 leading-tight uppercase mt-0.5">
                {flaw.description}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
