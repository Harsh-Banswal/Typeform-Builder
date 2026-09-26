import React from 'react';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';

const renderRatingShape = (shape: string, filled = false, size = 38) => {
  switch (shape) {
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "thumb_up":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10v12M15 10.5a3 3 0 0 0-3-3l-2-5-2 2v6H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h13.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4" />
        </svg>
      );
    case "crown":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "star":
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
};

export function QuestionRenderer({ question, answer, setAnswer, error, onNext }: any) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  if (!question) return <div className="text-gray-400 italic">Select a question to preview</div>;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center min-h-[60vh] font-sans">
      <div className="mb-8">
        <div className="flex items-start gap-3">
          {(question.order_index !== undefined || question.index !== undefined) && (
            <div className="w-6 h-6 rounded bg-[#181D27] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
              {(question.order_index ?? question.index) + 1}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-light text-gray-800 flex items-center">
              {question.title || "Your question here. Recall information with @"}
              {question.required && <span className="text-red-500 ml-1 text-xl">*</span>}
            </h1>
            <p className="text-gray-400 text-sm italic mt-1 font-light">
              {question.help_text || "Description (optional)"}
            </p>
          </div>
        </div>
      </div>

      <div>
        {question.type === "short_text" && (
          <input 
            type="text" 
            autoFocus
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-2xl py-2 bg-transparent transition-colors"
            placeholder="Type your answer here..."
            value={answer || ""}
            onChange={e => setAnswer?.(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter') onNext?.(); }}
          />
        )}
        
        {question.type === "long_text" && (
          <textarea 
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors resize-none"
            placeholder="Type your answer here..."
            rows={3}
            autoFocus
            value={answer || ""}
            onChange={e => setAnswer?.(e.target.value)}
          />
        )}

        {question.type === "email" && (
          <input 
            type="email" 
            autoFocus
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-2xl py-2 bg-transparent transition-colors"
            placeholder="name@example.com"
            value={answer || ""}
            onChange={e => setAnswer?.(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter') onNext?.(); }}
          />
        )}

        {question.type === "number" && (
          <input 
            type="number" 
            autoFocus
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-2xl py-2 bg-transparent transition-colors"
            placeholder="0"
            value={answer || ""}
            onChange={e => setAnswer?.(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter') onNext?.(); }}
          />
        )}

        {question.type === "website" && (
          <input 
            type="url" 
            autoFocus
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-2xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
            placeholder={question.config?.custom_placeholder_text || "https://"}
            value={answer || ""}
            onChange={e => setAnswer?.(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter') onNext?.(); }}
          />
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-3">
            {question.options?.map((opt: string, i: number) => (
              <div 
                key={i} 
                onClick={() => setAnswer?.(opt)}
                className={`p-3 border rounded-lg cursor-pointer flex items-center transition ${answer === opt ? 'border-black bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="w-6 h-6 border rounded flex items-center justify-center mr-3 text-sm font-medium bg-white">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-lg">{opt || `Option ${i+1}`}</span>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <div className="text-gray-400 italic">No options defined</div>
            )}
          </div>
        )}

        {question.type === "dropdown" && (
          <div className="relative max-w-xl">
            <select 
              className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-2xl py-3 pr-10 bg-transparent transition-colors cursor-pointer appearance-none text-gray-800"
              value={answer || ""}
              onChange={e => setAnswer?.(e.target.value)}
            >
              <option value="" disabled>{question.config?.custom_placeholder_text || "Type or select an option"}</option>
              {question.options?.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        )}

        {question.type === "yes_no" && (
          <div className="flex flex-col gap-2.5 max-w-md w-full">
            {[
              { label: "Yes", badge: "Y", color: "#00A389", activeBorder: "#00A389", activeBg: "#F0FAF8" },
              { label: "No",  badge: "N", color: "#EF4444", activeBorder: "#EF4444", activeBg: "#FEF2F2" },
            ].map(({ label, badge, color, activeBorder, activeBg }) => {
              const isSelected = answer === label;
              return (
                <div
                  key={label}
                  onClick={() => setAnswer?.(label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? "shadow-2xs" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={{
                    borderColor: isSelected ? activeBorder : undefined,
                    backgroundColor: isSelected ? activeBg : undefined,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-2xs"
                    style={{ backgroundColor: color }}
                  >
                    {badge}
                  </div>
                  <span className="text-gray-800 font-medium text-base">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {question.type === "legal" && (
          <div className="flex flex-col gap-2.5 max-w-md w-full">
            {[
              { label: (question.options && question.options[0]) || "I accept", badge: "A", color: "#00A389", activeBorder: "#00A389", activeBg: "#F0FAF8" },
              { label: (question.options && question.options[1]) || "I don’t accept", badge: "B", color: "#EF4444", activeBorder: "#EF4444", activeBg: "#FEF2F2" },
            ].map(({ label, badge, color, activeBorder, activeBg }) => {
              const isSelected = answer === label;
              return (
                <div
                  key={label}
                  onClick={() => setAnswer?.(label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? "shadow-2xs" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  style={{
                    borderColor: isSelected ? activeBorder : undefined,
                    backgroundColor: isSelected ? activeBg : undefined,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-2xs"
                    style={{ backgroundColor: color }}
                  >
                    {badge}
                  </div>
                  <span className="text-gray-800 font-medium text-base">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {question.type === "picture_choice" && (
          <div className="mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-xl">
              {(question.options && question.options.length > 0 ? question.options : [""]).map((opt: string, i: number) => {
                const imgUrl = question.config?.pictures?.[i];
                const choiceVal = opt || `Choice ${String.fromCharCode(65 + i)}`;
                const isSelected = answer === choiceVal;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setAnswer?.(choiceVal);
                    }}
                    className={`flex flex-col rounded-xl p-2 cursor-pointer transition-all border-2 ${
                      isSelected 
                        ? "border-[#00A389] bg-[#F0FAF8] shadow-sm" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg bg-[#ECECEC] overflow-hidden flex items-center justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={opt} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-gray-400">
                          <circle cx="8" cy="8" r="1.5" />
                          <path d="M4 17l4.5-5 3.5 3.5 3-3.5 5 5H4z" />
                          <path d="M17 3v4M15 5h4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-0.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                        isSelected ? "bg-[#00A389] text-white" : "border border-gray-300 bg-white text-gray-700"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-xs font-medium text-gray-800 truncate">
                        {opt || `Choice ${String.fromCharCode(65 + i)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {question.type === "net_promoter_score" && (
          <div className="mt-4 max-w-xl">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {Array.from({ length: 11 }).map((_, i) => {
                const isSelected = answer === String(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAnswer?.(String(i));
                      setTimeout(() => onNext?.(), 300);
                    }}
                    className={`flex-1 aspect-square rounded-lg text-sm font-semibold transition-all border ${
                      isSelected 
                        ? "bg-[#181D27] text-white border-[#181D27] shadow-sm" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500 font-normal select-none">
              <span>{question.config?.left_label || "Not likely at all"}</span>
              <span>{question.config?.right_label || "Extremely likely"}</span>
            </div>
          </div>
        )}

        {question.type === "opinion_scale" && (() => {
          const startAt = question.config?.start_at !== undefined ? Number(question.config.start_at) : 0;
          const endAt = question.config?.end_at !== undefined ? Number(question.config.end_at) : (question.config?.scale !== undefined ? Number(question.config.scale) - 1 : 10);
          const steps = Array.from({ length: Math.max(1, endAt - startAt + 1) }, (_, i) => startAt + i);
          const startLabel = question.config?.start_label;
          const midLabel = question.config?.middle_label;
          const endLabel = question.config?.end_label;
          const hasLabels = Boolean(startLabel || midLabel || endLabel);

          return (
            <div className="mt-4 max-w-xl">
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                {steps.map((val) => {
                  const isSelected = answer === String(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAnswer?.(String(val));
                        setTimeout(() => onNext?.(), 300);
                      }}
                      className={`flex-1 aspect-square rounded-lg text-sm font-semibold transition-all border ${
                        isSelected 
                          ? "bg-[#181D27] text-white border-[#181D27] shadow-sm" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              {hasLabels && (
                <div className="flex justify-between mt-3 text-xs text-gray-500 font-normal select-none px-0.5">
                  <span className="text-left flex-1">{startLabel || ""}</span>
                  <span className="text-center flex-1">{midLabel || ""}</span>
                  <span className="text-right flex-1">{endLabel || ""}</span>
                </div>
              )}
            </div>
          );
        })()}

        {question.type === "rating" && (() => {
          const count = question.config?.steps || question.config?.scale || 3;
          const shape = question.config?.shape || "star";
          const currentVal = answer ? parseInt(answer) : 0;
          const activeVal = hoverRating !== null ? hoverRating : currentVal;

          return (
            <div className="mt-4 flex items-center gap-3 sm:gap-6 flex-wrap select-none" onMouseLeave={() => setHoverRating(null)}>
              {Array.from({ length: count }).map((_, i) => {
                const val = i + 1;
                const isFilled = activeVal >= val;
                return (
                  <button
                    key={val}
                    type="button"
                    onMouseEnter={() => setHoverRating(val)}
                    onClick={() => {
                      setAnswer?.(String(val));
                      setTimeout(() => onNext?.(), 300);
                    }}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110 active:scale-95 outline-none"
                  >
                    <div className={`transition-colors ${isFilled ? "text-[#181D27]" : "text-gray-300 group-hover:text-gray-500"}`}>
                      {renderRatingShape(shape, isFilled, 40)}
                    </div>
                    <span className={`text-xs transition-colors ${isFilled ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                      {val}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {question.type === "ranking" && (() => {
          const options: string[] = question.options && question.options.length > 0 ? question.options : ["Choice 1", "Choice 2"];
          const rankedList: string[] = Array.isArray(answer) 
            ? answer 
            : (typeof answer === "string" && answer.startsWith("[") 
                ? (() => { try { return JSON.parse(answer); } catch { return []; } })() 
                : []);

          const toggleRank = (opt: string) => {
            let next: string[];
            if (rankedList.includes(opt)) {
              next = rankedList.filter(item => item !== opt);
            } else {
              next = [...rankedList, opt];
            }
            setAnswer?.(next);
          };

          const moveRank = (opt: string, direction: "up" | "down") => {
            const idx = rankedList.indexOf(opt);
            if (idx === -1) return;
            const newIdx = direction === "up" ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= rankedList.length) return;
            const next = [...rankedList];
            const temp = next[idx];
            next[idx] = next[newIdx];
            next[newIdx] = temp;
            setAnswer?.(next);
          };

          const isAllRanked = options.length > 0 && options.every(opt => rankedList.includes(opt));

          return (
            <div className="mt-4 max-w-sm">
              <div className="space-y-2.5">
                {options.map((opt: string, idx: number) => {
                  const rankIdx = rankedList.indexOf(opt);
                  const isRanked = rankIdx !== -1;
                  const rankNumber = isRanked ? rankIdx + 1 : null;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleRank(opt)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        isRanked 
                          ? "bg-white border-[#181D27] shadow-xs" 
                          : "bg-[#ECECEC] border-transparent hover:bg-[#E5E5E5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded text-xs font-semibold transition-colors ${
                          isRanked 
                            ? "bg-[#181D27] text-white" 
                            : "bg-white/80 text-gray-500 border border-gray-200/60"
                        }`}>
                          {isRanked ? rankNumber : "- ▾"}
                        </div>
                        <span className={`text-sm ${isRanked ? "font-medium text-gray-900" : "text-gray-700"}`}>
                          {opt || `Choice ${idx + 1}`}
                        </span>
                      </div>

                      {isRanked && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={rankIdx === 0}
                            onClick={() => moveRank(opt, "up")}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                            title="Move up"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                          </button>
                          <button
                            type="button"
                            disabled={rankIdx === rankedList.length - 1}
                            onClick={() => moveRank(opt, "down")}
                            className="p-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400"
                            title="Move down"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isAllRanked && (
                <button
                  type="button"
                  onClick={() => onNext?.()}
                  className="mt-5 px-5 py-2 rounded-lg bg-[#181D27] text-white text-sm font-semibold hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                >
                  OK <span>✓</span>
                </button>
              )}
            </div>
          );
        })()}

        {question.type === "phone_number" && (
          <PhoneInputWithCountry
            value={answer || ""}
            onChange={val => setAnswer?.(val)}
            onEnter={onNext}
            autoFocus
          />
        )}

        {question.type === "contact_info" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="First name"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.firstName = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ firstName: e.target.value }));
                  }
                }}
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.lastName = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ lastName: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone number</label>
              <PhoneInputWithCountry
                value={(() => {
                  try { return JSON.parse(answer || "{}").phone || ""; }
                  catch { return ""; }
                })()}
                onChange={val => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.phone = val;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ phone: val }));
                  }
                }}
                onEnter={onNext}
                compact
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors"
              onChange={e => {
                try {
                  const parsed = JSON.parse(answer || "{}");
                  parsed.email = e.target.value;
                  setAnswer?.(JSON.stringify(parsed));
                } catch {
                  setAnswer?.(JSON.stringify({ email: e.target.value }));
                }
              }}
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors"
              onChange={e => {
                try {
                  const parsed = JSON.parse(answer || "{}");
                  parsed.company = e.target.value;
                  setAnswer?.(JSON.stringify(parsed));
                } catch {
                  setAnswer?.(JSON.stringify({ company: e.target.value }));
                }
              }}
            />
          </div>
        )}

        {question.type === "address" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Address</label>
              <input
                type="text"
                placeholder="65 Hansen Way"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.address = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ address: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Address line 2</label>
              <input
                type="text"
                placeholder="Apartment 4"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.addressLine2 = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ addressLine2: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">City/Town</label>
              <input
                type="text"
                placeholder="Palo Alto"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.city = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ city: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">State/Region/Province</label>
              <input
                type="text"
                placeholder="California"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.state = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ state: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Zip/Post code</label>
              <input
                type="text"
                placeholder="94304"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.zip = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ zip: e.target.value }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Country</label>
              <input
                type="text"
                placeholder="United States"
                className="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl py-2 bg-transparent transition-colors placeholder:text-gray-400 font-light"
                onChange={e => {
                  try {
                    const parsed = JSON.parse(answer || "{}");
                    parsed.country = e.target.value;
                    setAnswer?.(JSON.stringify(parsed));
                  } catch {
                    setAnswer?.(JSON.stringify({ country: e.target.value }));
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-[#C2410C] bg-[#FFF7ED] border border-[#FDBA74] px-3.5 py-2 rounded-xl w-fit shadow-2xs animate-in fade-in slide-in-from-top-1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {onNext && question.type === "website" && (
        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onNext}
            className="bg-[#181D27] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-black transition flex items-center gap-1.5 shadow-sm"
          >
            <span>OK</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal">
            <span>press</span>
            <span className="border border-gray-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-gray-500 bg-white shadow-2xs">Enter ↵</span>
          </div>
        </div>
      )}
    </div>
  );
}
