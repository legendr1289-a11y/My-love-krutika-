import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface RomanticLetterProps {
  fadeKey: number;
  onReplayFade: () => void;
  onSpawnEmoji: (emoji: string) => void;
  isSongPlaying: boolean;
}

const REACTION_EMOJIS = [
  { emoji: '🥹', label: 'Emotional' },
  { emoji: '💖', label: 'Heart' },
  { emoji: '👀', label: 'Her Eyes' },
  { emoji: '🫶🏻', label: 'Love' },
  { emoji: '🌷', label: 'Soul' },
  { emoji: '🤍', label: 'Pure' },
];

export function RomanticLetter({
  fadeKey,
  onReplayFade,
  onSpawnEmoji,
  isSongPlaying,
}: RomanticLetterProps) {
  const [scriptMode, setScriptMode] = useState<'hindi' | 'hinglish'>('hindi');

  return (
    <article
      id="letter"
      className="glass-panel rounded-3xl p-7 sm:p-10 flex flex-col justify-between gap-7"
    >
      {/* Top Bar of the Letter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b9778b]/15 pb-5">
        <div>
          <p className="text-xs font-medium text-[#8c5a6a]">
            Written From the Heart · मेरी क्यूटी पाई बीवी के लिए <span className="ios-emoji">🫶🏻</span>
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#351d26] mt-1">
            {scriptMode === 'hindi' ? 'तुम्हारी आँखें और तुम्हारी रूह' : 'Tumhari Aankhein Aur Tumhari Rooh'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Script Mode Segmented Control */}
          <div
            role="group"
            aria-label="Script display mode"
            className="flex items-center gap-1 p-1 rounded-full bg-white/55 border border-white/80"
          >
            <button
              type="button"
              onClick={() => setScriptMode('hindi')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                scriptMode === 'hindi'
                  ? 'bg-[#c94a6a] text-white shadow-sm'
                  : 'text-[#6e4956] hover:text-[#351d26]'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setScriptMode('hinglish')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                scriptMode === 'hinglish'
                  ? 'bg-[#c94a6a] text-white shadow-sm'
                  : 'text-[#6e4956] hover:text-[#351d26]'
              }`}
            >
              Hinglish
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onReplayFade();
              onSpawnEmoji('🌷');
            }}
            title="Replay gentle fade-in"
            className="glass-pill-button inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-[#5c3543] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#c94a6a]" />
            <span>Replay Fade</span>
          </button>
        </div>
      </div>

      {/* Gentle Fade-In Ghazal + Human Poetic Paragraph */}
      <div key={`${fadeKey}-${scriptMode}`} className="space-y-6">
        {scriptMode === 'hindi' ? (
          <>
            {/* Opening Ghazal Couplet */}
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-hindi text-lg sm:text-xl leading-relaxed text-[#7c2944] italic pl-1"
            >
              “तुम्हारी आँखों में कोई गहरा समंदर सा ठहर जाता है,
              <br />
              एक नज़र देख लो तो मेरा हर थका हुआ दिन संवर जाता है।” <span className="ios-emoji not-italic">👀✨</span>
            </motion.blockquote>

            {/* Human-written Poetic Paragraph on Her Eyes & Soul */}
            <div className="font-hindi text-[17px] sm:text-[18.5px] leading-[1.95] text-[#3a1f28] space-y-5">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.35, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
              >
                मेरी क्यूटी पाई बीवी <span className="ios-emoji">🥹💖</span>, सच कहूँ तो तुम्हारी आँखें सिर्फ़ खूबसूरत नहीं हैं,
                उनमें एक ऐसा सुकून बसता है जो बिना कुछ कहे ही मेरे दिल का हर हाल पढ़ लेता है। जब तुम हल्का सा मुस्कुराकर
                मेरी तरफ़ देखती हो, तो लगता है जैसे ज़िंदगी की सारी भागदौड़ वहीं ठहर गई हो और वक़्त सिर्फ़ हमारे लिए रुक गया हो।
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.35, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
              >
                और तुम्हारी रूह—वो तो किसी सुबह की पहली नरम धूप जैसी पाक, सच्ची और बेहद प्यारी है <span className="ios-emoji">🌷🤍</span>।
                तुम्हारे दिल की मासूमियत, तुम्हारी छोटी-छोटी प्यारी आदतें, और अपनों के लिए तुम्हारा बेपनाह प्यार मुझे हर रोज़
                तुमसे एक नई मोहब्बत करने की वजह दे देता है। दुनिया की हर भीड़ में मेरी नज़रें बस तुम्हारे ही चेहरे पर आकर सुकून पाती हैं।
              </motion.p>
            </div>

            {/* Closing Ghazal / Nazm Couplet */}
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.35, delay: 3.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-hindi text-lg sm:text-xl leading-relaxed text-[#7c2944] italic pt-2 border-t border-[#b9778b]/15"
            >
              “न हीरे की चमक चाहिए, न दुनिया की कोई दौलत मुझे,
              <br />
              बस तुम्हारी आँखों का काजल और तुम्हारी रूह की खुशबू उम्र भर मेरे साथ रहे।” <span className="ios-emoji not-italic">🫶🏻🌙</span>
            </motion.blockquote>
          </>
        ) : (
          <>
            {/* Hinglish Edition */}
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-xl sm:text-2xl leading-relaxed text-[#7c2944] italic pl-1"
            >
              “Tumhari aankhon mein koi gehra samandar sa thehar jaata hai,
              <br />
              Ek nazar dekh lo toh mera har thaka hua din sanwar jaata hai.” <span className="ios-emoji not-italic">👀✨</span>
            </motion.blockquote>

            <div className="text-[16px] sm:text-[17px] leading-[1.85] text-[#3a1f28] space-y-5">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.35, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
              >
                Meri cutie pie Biwi <span className="ios-emoji">🥹💖</span>, sach kahoon toh tumhari aankhein sirf khoobsurat nahi hain,
                unmein ek aisa sukoon basta hai jo bina kuch kahe hi mere dil ka har haal padh leta hai. Jab tum halka sa muskura kar
                meri taraf dekhti ho, toh lagta hai jaise zindagi ki saari bhaagdaud wahin thehar gayi ho aur waqt sirf hamare liye ruk gaya ho.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.35, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Aur tumhari rooh—woh toh kisi subah ki pehli naram dhoop jaisi paak, sacchi aur behad pyaari hai <span className="ios-emoji">🌷🤍</span>.
                Tumhare dil ki masoomiyat, tumhari chhoti-chhoti pyaari aadatein, aur apno ke liye tumhara bepanaah pyaar mujhe har roz
                tumse ek nayi mohabbat karne ki wajah de deta hai. Duniya ki har bheed mein meri nazrein bas tumhare hi chehre par aakar sukoon paati hain.
              </motion.p>
            </div>

            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.35, delay: 3.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-xl sm:text-2xl leading-relaxed text-[#7c2944] italic pt-2 border-t border-[#b9778b]/15"
            >
              “Na heere ki chamak chahiye, na duniya ki koi daulat mujhe,
              <br />
              Bas tumhari aankhon ka kaajal aur tumhari rooh ki khushboo umr bhar mere saath rahe.” <span className="ios-emoji not-italic">🫶🏻🌙</span>
            </motion.blockquote>
          </>
        )}
      </div>

      {/* Interactive iOS Emoji Love Tap Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 4.1, ease: [0.22, 1, 0.36, 1] }}
        className="pt-4 border-t border-[#b9778b]/15 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="text-xs text-[#7b4c5c]">
          {isSongPlaying ? (
            <span>Listening to Good Luck Charm together <span className="ios-emoji">🎶</span></span>
          ) : (
            <span>Tap an emoji to float love across the screen <span className="ios-emoji">✨</span></span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {REACTION_EMOJIS.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => onSpawnEmoji(item.emoji)}
              aria-label={`Send ${item.label} emoji`}
              className="glass-pill-button w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform duration-150 hover:scale-115 active:scale-90 cursor-pointer"
            >
              <span className="ios-emoji">{item.emoji}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </article>
  );
}
