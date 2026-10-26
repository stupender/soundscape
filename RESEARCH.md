# Leave room for the voice, stage by stage

*A research report on the Soundscape roadmap, written for Stu Pender. Researched 26 October 2026. Sources are paraphrased and linked; short quotes are marked. Bön, Buddhist (Maitri) and Silvia Nakkach's correspondences are kept apart, each with its source named.*

The research supports the roadmap's direction and changes a handful of its details. **The most urgent finding is about the live V1 app.** When the mic opens on an iPhone, iOS moves AirPods and other Bluetooth headphones into "phone call" mode: low-quality mono both ways, with the mic at 16 kHz. So a singer recording in AirPods hears the soundscape drop to call quality and records through the AirPods mic. Only a native app can fully avoid this, so for now the app should recommend wired headphones for recording. **The second finding is about saved takes.** Safari can wipe a website's stored data after seven days without a visit, so takes need `navigator.storage.persist()`, a home-screen install, or an export to be safe. Further out, the work splits cleanly by stage. **V1.x** should stream long files rather than decode them, and should move to Capacitor at a clear trigger. **V1.5** should build a small "rack" of modules on one shared contract, with breathing presets centred on six breaths a minute (the roadmap's 4:8 and 5:10 presets are slower than that). **V2** can rebuild Eno, Chilvers and Reich from six Web Audio building blocks; Krause's spectrogram becomes a "room for the voice" measure, and session arcs become sequences of named phases joined by equal-power, staggered crossfades. **V3** should use a standard Bluetooth chest strap for live biofeedback, because Oura and Whoop only send summaries hours later and HeartMath has no public developer route. **Horizon** work should accompany Bön, Maitri and Nakkach practices without teaching them, and should credit each tradition separately, because their element tables disagree. The same rule runs through every stage: the app can promise relaxation, practice and listening, but never treatment, brainwave effects or heart measurement it doesn't make.

## V1 now: AirPods turn the recorder into a phone call

### What the research found

V1 already sets Safari's audio session to `playback` while listening and to `play-and-record` while the mic is on. That is why it plays through the silent switch. Safari has supported part of the Audio Session API since version 16.4 ([WebKit](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/); [MDN](https://developer.mozilla.org/docs/Web/API/AudioSession/type)). The catch is Bluetooth. **Opening the mic switches Bluetooth headphones from their stereo, output-only mode (A2DP) to the two-way call mode (HFP), which is mono and 16 kHz.** That degrades the soundscape in the singer's ears and records the voice through the headset mic ([val.town iOS Bluetooth notes](https://www.val.town/embed/x/c15r/mochi/design/ios-bluetooth-audio.md)). The mismatch between 16 kHz headsets and a 44.1 or 48 kHz device has also caused pitch-shift ("chipmunk") bugs in Safari, including when AirPods connect or disconnect in the middle of a session ([WebKit bug 231422](https://bugs.webkit.org/show_bug.cgi?id=231422); [WebKit bug 232822](https://bugs.webkit.org/show_bug.cgi?id=232822)). A native app can turn off the call-mode option so that the phone's own mic records while the headphones stay in stereo ([JUCE forum](https://forum.juce.com/t/fr-disable-bluetooth-hfp-by-default/49875)). A web page cannot.

Takes are at risk in a different way. Since Safari 17, a site can use a large share of the disk and can ask for persistent storage with `navigator.storage.persist()`, which Safari grants based on signals such as a home-screen install ([WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)). Separately, **Safari's tracking prevention deletes all of a site's script-written storage, IndexedDB included, after seven days without a visit, unless the site is installed to the home screen** ([WebKit Tracking Prevention](https://webkit.org/tracking-prevention/)). A singer who records on Monday and comes back nine days later could find their takes gone.

Background playback has improved but hasn't always been reliable. A bug that paused Web Audio when the page went to the background, even in `playback` mode, came back in iOS 17.2–17.3 and was fixed in 17.5 ([WebKit bug 261554](https://bugs.webkit.org/show_bug.cgi?id=261554)). Home-screen web apps have had worse locked-screen audio than Safari tabs for years ([WebKit bug 198277](https://bugs.webkit.org/show_bug.cgi?id=198277); [WebKit bug 261858](https://bugs.webkit.org/show_bug.cgi?id=261858)). So installing to the home screen is better for storage and worse for background audio. Two cheap features help either way. The Media Session API (iOS Safari 15 and later) puts a title and controls on the lock screen, and Screen Wake Lock (iOS Safari 16.4 and later) can keep the screen on during a timed session ([caniuse: Media Session](https://caniuse.com/mdn-api_mediasession); [caniuse: Wake Lock](https://caniuse.com/wake-lock)). The session timer already keeps time against the audio clock rather than by counting timer ticks, which is the right defence against background slow-down.

### Act on now

| # | Do this | Why |
|---|---|---|
| 1 | In the headphones prompt and recording tips, say plainly: "For recording, wired headphones are best. With AirPods or other Bluetooth headphones, the soundscape drops to phone-call quality while you record." | The `play-and-record` switch puts Bluetooth into call mode (mono, 16 kHz). |
| 2 | Call `navigator.storage.persist()` when the first take is saved. Add one line to Takes: "Takes live only on this device. Export the ones you want to keep, or add Soundscape to your home screen." | Safari can wipe a tab's storage after 7 days without a visit; home-screen apps are exempt. |
| 3 | Add Media Session metadata (title, artwork, play/pause), and hold a Wake Lock while a session timer runs. | Lock-screen controls, and no screen sleep mid-session. Both work in iOS Safari today. |
| 4 | On a real iPhone running the current iOS, test locked-screen playback twice: in a Safari tab and from the home screen. Note the result in MAINTENANCE.md. | Background audio has broken in some iOS point releases, and home-screen apps behave differently from tabs. |
| 5 | Change the niche-hypothesis line in V2 to: "Krause's niche hypothesis: in many long-established habitats, voices tend to find their own band of pitch or their own moment in time. It's influential, partly supported, and still debated." | Later studies find partitioning often happens in **time**, not only in pitch, and not everywhere (see V2). |
| 6 | Correct the module-rack references in V1.5. The Phono Loop makes Kontakt sample instruments (Tapes.01, outlines, themkI), not modular apps; its two-page interface is the reference for a module's face. Chassis is a semi-modular desktop synth (macOS/Windows). Add k.odk's seven iPhone instruments and the OP-Z as the clearest "shared grammar" references. | The current wording describes The Phono Loop inaccurately ([The Phono Loop](https://thephonoloop.com); [Lux Cache](https://luxcache.com/shop)). |
| 7 | Change "a sleep timer that fades the soundscape out over a long arc (as Endel does)" and "Endel's bedtime timer" to: "a sleep timer with a long, adjustable fade (Bloom has one; Endel shapes sleep as phases: winding down, drifting off, deep sleep)". | No source documents Endel's sleep timer or fade length. Bloom's sleep timer is documented ([Bloom](https://www.generativemusic.com/bloom.html); [Endel Science](https://www.endel.io/science)). |
| 8 | Correct the Breath presets: make **5 in, 5 out (6 a minute)** the default and the 365 pace. Label 4:8 as 5 a minute and 5:10 as 4 a minute (advanced). | 4:8 is a 12-second breath (5 per minute); 5:10 is 15 seconds (4 per minute), below the range breath researchers normally test (see V1.5). |
| 9 | Create RESEARCH.md (ROADMAP.md links to it, but it doesn't exist) and link this report from it. Copy the "claims the app must not make" table at the end of this report into CLAUDE.md. | That way any future code, copy or helper model follows the same guardrails. |

### Open questions

Could choosing the iPhone's built-in mic by `deviceId` keep AirPods in stereo while recording from the web? No source confirms it either way, so it needs a ten-minute test on a device. It's also worth checking whether Safari grants `persist()` to a tab that isn't installed, or only after a home-screen install.

## V1.x: stream the long keys, and move to Capacitor at a clear trigger

### What the research found

**Decoded audio is large.** A decoded `AudioBuffer` holds 32-bit numbers: about 23 MB per stereo minute at 48 kHz. A full 56-minute 12-keys file would decode to roughly 1.3 GB, far too much for a phone (simple arithmetic: 48,000 samples × 2 channels × 4 bytes × 60 seconds × 56 minutes). Long beds should therefore stream through an `<audio>` element into a `MediaElementAudioSourceNode`, which `loop.ts` already does for large files. Only short loops should be decoded. Hosting the full files on Cloudflare R2 or the website's own hosting fits this path. One practical check: the bucket must send CORS headers for the site, because the app loads streamed audio with `crossOrigin = 'anonymous'`.

Clean-up tools, a count-in, trimming and Google Drive upload weren't researched in this pass. For the "install it" item, the research gives a clear decision rule. **Stay a website while the core use is listening and recording with wired headphones or the phone's own mic.** Move to Capacitor, as Becoming has, when the first of these becomes a must-have:

- an hour of locked-screen playback for client sessions;
- recording with Bluetooth headphones without call-quality audio;
- any Bluetooth biofeedback on iPhone;
- MIDI on iPhone or iPad;
- Apple Health data.

Every item on that list needs native code. iOS browsers have no Web Bluetooth and no Web MIDI ([caniuse: Web Bluetooth](https://caniuse.com/web-bluetooth); [caniuse: Web MIDI](https://caniuse.com/midi)). WebKit has said it opposes generic device APIs like Web Bluetooth ([W3C list, 2024](https://lists.w3.org/Archives/Public/public-web-bluetooth/2024Sep/0002.html)).

Inside Capacitor, add plugins in this order:

1. An audio-session plugin (Capawesome's sets category, mode and options and watches for interruptions), plus the `audio` background mode ([Capawesome Audio Session](https://capawesome.io/docs/sdks/capacitor/audio-session/)).
2. `@capacitor-community/bluetooth-le` for heart-rate straps ([GitHub](https://github.com/capacitor-community/bluetooth-le)).
3. A HealthKit plugin ([@capgo/capacitor-health](https://cdn.jsdelivr.net/npm/@capgo/capacitor-health@8.7.0/README.md)).
4. A small custom CoreMIDI bridge. No maintained Capacitor MIDI plugin was found ([Apple CoreMIDI](https://developer.apple.com/documentation/coremidi)).

Even inside a wrapper, some developers report that web-view audio still stops in the background ([Apple forums 713084](https://developer.apple.com/forums/thread/713084)). The fallback is to play the soundscape bed through a native audio-player plugin for locked-screen sessions ([Capawesome Audio Player](https://capawesome.io/plugins/audio-player/)). Apple rejects apps that feel "not sufficiently different from using a mobile browser" under Guideline 4.2 ([Apple forums 835422](https://developer.apple.com/forums/thread/835422)). Soundscape's native features (background audio, Bluetooth, HealthKit) are exactly what answers that objection.

### What it means for the app

Keep the web version live as the "try it" door, even after a native app exists. Build the native app from the same code, as Becoming does. The trigger will most likely be V1.5 coherence with a chest strap, or V3 client sessions with the screen locked. Don't wrap the app before then.

### Open questions

Does Web Audio keep playing in the background inside Becoming's existing Capacitor wrapper on the current iOS? Nobody has published a result, so test it in Becoming before building Soundscape's wrapper.

## V1.5: a rack of small modules, and breath at six a minute

### The module rack: fixed slots, one face, rigs as JSON

The references converge on one simple pattern, and none of them needs free patch cables:

- **Teenage Engineering's OP-Z** has a fixed set of 16 tracks: eight make sound, and eight are *control* tracks (effects, tape, master, perform, lights, motion) that are sequenced in the same way ([OP-Z guide](https://teenage.engineering/guides/op-z/tracks)).
- **k.odk's seven iPhone instruments** each add one idea to a shared grammar of XY pads, named rooms, presets down the side and the same output chain ([k.odk](https://keiodak.github.io/privacy/links.html)). Their presets "store the whole instrument", including the recorded material ([Tīwesdæg](https://apps.apple.com/app/id6813998626)). One of them loads a test tone at launch so it makes sound the moment it opens ([Frīgedæg](https://apps.apple.com/app/id6813849843)). Another has a LINK switch that either locks two loops together or lets them drift ([Mōnandæg](https://apps.apple.com/app/id6814002096)), which is a ready-made reference for V2.
- **The Phono Loop's Tapes.01** opens on one page of essential controls, with depth on a second page ([Tapes.01](https://thephonoloop.com/products/tapes-01)).
- **FFOSSO** separates playful one-idea "engines" from a beta "Modular Grid" for builders ([FFOSSO](https://www.ffosso.com)).
- **Ableton Racks** hide complexity behind a few macro knobs and store snapshots as "variations" ([Ableton manual](https://www.ableton.com/en/manual/instrument-drum-and-effect-racks/)).
- **VCV Rack** shows that agreed conventions for levels and ranges matter more than any single module ([VCV manual](https://vcvrack.com/manual/VoltageStandards)).
- **Web Audio Modules 2.0** is the web's own plug-in standard. Each module has a descriptor, `createAudioNode`, `createGui`, `getState`/`setState`, and event scheduling against `AudioContext.currentTime` ([webaudiomodules/api](https://github.com/webaudiomodules/api)).

**For Soundscape, copy WAM's shape but not its machinery.** Each module is one small TypeScript file exporting a plain object with these parts:

- a `type` and a `name`;
- `needs` (for example `key`, `soundscapeBus`, `mic`, `clock`) and `offers`;
- flat `defaults`, using 0–1 ranges where possible;
- `create(ctx, host)`, which returns an instance with `destroy()`, `getState()` and `setState()` (plain JSON only);
- a small React `Face` (page one: two to four controls) and an optional `Detail` (page two).

The host provides named gain buses (soundscape, voice, master, record tap), the shared Key and one clock. Modules connect to buses by name rather than to each other. Breath, Sleep fade, Timer and Five Elements are *control modules* in the OP-Z sense: they make no sound, they move other modules' levels and filters over time. A **rig** is then `{schema, name, global: {key, masterLevel}, modules: [{id, type, state}]}`. It saves to IndexedDB or a `.json` file, and refers to takes by id rather than embedding the audio. Ship curated rigs first (Recorder, Breathing companion, Sleep, Teaching) and put "edit the rack" one level down, as FFOSSO does. This fits CLAUDE.md's rules: plain React, plain Web Audio, small files, no Tone.js.

### Breath: six a minute is the evidence-based centre

**Slow breathing reliably raises the vagal ("rest and digest") part of heart-rate variability.** This shows up during practice, straight after one session, and after programmes of several sessions, in a review of 223 studies ([Laborde et al. 2022](https://eprints.bournemouth.ac.uk/38169/)). The effects on stress, anxiety and mood are smaller and less certain. A meta-analysis of 58 studies of heart-rate-variability biofeedback found a "small to moderate" benefit ([Lehrer et al. 2020](https://scholarship.libraries.rutgers.edu/esploro/outputs/journalArticle/Heart-Rate-Variability-Biofeedback-Improves-Emotional/991031738034904646)). The standard way to find a person's best pace steps from 6.5 down to 4.5 breaths a minute ([Shaffer & Meehan 2020](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7578229/)). **The popular long exhale is not proven to be better.** A direct test at six a minute found no heart-rate-variability difference between 1:1 and 1:2, and earlier studies split every way ([Meehan & Shaffer 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11310264/)). An exhale-weighted "cyclic sighing" practice did give the largest mood gain in one month-long trial ([Balban et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947)).

| Preset | In : out | One breath | Breaths a minute |
|---|---|---|---|
| Coherence 6 (default; the 365 pace) | 5 : 5 | 10 s | 6 |
| Long exhale 6 | 4 : 6 | 10 s | 6 |
| Calm 5 | 4 : 8 | 12 s | 5 |
| Deep 4 (advanced) | 5 : 10 | 15 s | 4 |
| Custom | 2–8 s in, 2–12 s out, optional holds | shown live | shown live |

Offer the long exhale as a felt preference ("many people find a longer out-breath settling"), not as the more effective option. A "find your pace" session could step from 6.5 to 4.5 a minute and ask which pace felt easiest. Without a sensor, call it what it is: a felt choice. In sound, let the swell follow the inhale (level or filter opening) and the fall follow the exhale. Use smooth raised-cosine curves, with an optional soft cue tone in the Key at each turn.

### Cardiac coherence and the 365 practice

"Cardiac coherence" is HeartMath's term for a smooth heart-rhythm wave near 0.1 Hz, usually reached by breathing about six times a minute. HeartMath scores it as the power of the strongest peak in the 0.04–0.26 Hz band divided by everything else in that band ([ClinicalTrials.gov NCT02426476](https://clinicaltrials.gov/study/NCT02426476)). Much of the broader evidence is vendor-affiliated, and a Swiss review notes methodological weaknesses and company funding in many coherence studies ([Le Temps](https://www.letemps.ch/opinions/chroniques/la-coherence-cardiaque-une-realite-physiologique)). The **365** rule (3 times a day, 6 breaths a minute, 5 minutes) comes from the French physician David O'Hare ([Mollat listing](https://www.mollat.com/livres/2387977/david-o-hare-coherence-cardiaque-365-3-fois-par-jour-6-fois-par-minute-5-minutes-guide-de-respiration-antistress)). No trial of the 365 schedule itself was found. Guy Desbiolles appears as a HeartMath practitioner who has taught cardiac coherence with Tenzin Wangyal Rinpoche in Ligmincha's CyberSangha programmes ([Ligmincha, part 1](https://ligmincha.org/events/free-event-heart-inner-smile-being-in-tune-w-cardiac-coherence/); [part 2](https://ligmincha.org/?p=43136)). That puts him inside Stu's own Bön lineage, so the "where invited" approach should go through Ligmincha.

**Build the coherence module as the Breath module locked to 5:5 for five minutes, with a gentle "three times today" tally.** It needs no new science, and it must not show a "coherence score" unless a sensor is connected (see V3). A cautionary precedent: RESPeRATE, a breathing device cleared for blood pressure, looked effective in trials its maker was involved in, and showed no effect once those trials were removed ([Oxford ORA](https://ora.ox.ac.uk/objects/uuid:0952a574-7489-4906-84a3-f433032f14f6)).

### Binaural beats: a real sound, an unproven mechanism

Binaural beats are a real thing you hear, within limits. Both tones need to be below about 1000 Hz (clearest near 400 Hz), and differences above about 30 Hz are heard as two separate tones. Below about 3 Hz the beat sounds like slow rotation; up to about 20 Hz it sounds like fluctuation ([Ingendoh et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/)). The same review found that "brainwave entrainment" is unsettled. **Of 14 EEG studies, 5 supported entrainment and 8 contradicted it, and every study that embedded the beats in pink noise found no entrainment.** That last point matters, because a soundscape is itself a noisy background. A 2019 meta-analysis found a medium overall behavioural effect across memory, attention, anxiety and pain (g = 0.45, 22 studies) ([Garcia-Argibay et al.](https://pubmed.ncbi.nlm.nih.gov/30073406/)), while a later one called the results "mixed" ([PubMed 35842538](https://pubmed.ncbi.nlm.nih.gov/35842538/)). A 2025 trial funded by Universal Music found less anxiety with a *monaural* beat inside music, but it had no music-only comparison group ([Venkatesan et al.](https://www.frontiersin.org/articles/10.3389/fpsyg.2025.1539823/full)).

To tune to the Key, use the tonic or fifth around octave 3 as the carrier. In D, for example, the left ear hears 146.83 Hz and the right ear hears 146.83 Hz plus 4–8 Hz. Keep the difference under about 12 Hz, mix the beats 20–30 dB under the soundscape, and fade them in over at least 10 seconds. Name the settings by what you hear ("slow pulse", "shimmer"), not by brain state ("theta", "delta"). Speaker-friendly isochronic or monaural pulses belong in the Five Elements rhythm module rather than here.

### Sleep: quiet, slow, and staged

Music listening improved self-rated sleep quality in a Cochrane review of 13 trials (1,007 people with insomnia), with only low-certainty evidence for falling asleep sooner ([Cochrane](https://www.cochrane.org/CD010459/music-listening-to-improve-sleep-quality)). Continuous white or pink noise has weak, inconsistent evidence ([Capezuti et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9163611/)). The striking pink-noise results came from noise timed to deep-sleep stages, which a continuous soundscape doesn't reproduce ([Sleep Foundation](https://www.sleepfoundation.org/pink-noise)). WHO's guideline for night noise outside is 40 dB ([WHO Europe](https://www.who.int/europe/publications/i/item/9789289041737)), and its safe-listening limit is 80 dBA for 40 hours a week for adults ([WHO](https://www.who.int/publications/i/item/9789241515276)). Endel stages sleep as phases (winding down, sleep activation, drifting off, deep sleep), uses a recurring cue sound, and puts broadband noise early and breath-like nature sounds later ([Endel Science](https://www.endel.io/science); [Amazon Science](https://www.amazon.science/latest-news/the-science-behind-endels-ai-powered-soundscapes)).

For Soundscape, the Sleep module should:

- open with a short bell in the Key;
- thin the layers (birds first, then shruti) and lower the brightness;
- settle on river or ocean;
- then fade over 10–60 minutes, chosen by the user, with high frequencies going first. Users of other apps complain when a sleep timer "abruptly shuts off" ([AntennaPod forum](https://forum.antennapod.org/t/sleep-timer-slower-fade-out/6574)), so the fade must reach silence smoothly.

"Stays on all night" should default to speakers, cap the level at "barely audible from bed", remove sharp sounds, and leave out binaural beats, since they need headphones.

### Five Elements and MIDI

The safest framing for the Five Elements module comes from Stu's own teacher. Nakkach's list of improvisation strategies includes "Voice of the Elements" (watery, earthy, fiery, airy, etheric): elements as *qualities of voice and sound*, not ritual correspondences (Nakkach, *Free Your Voice*, Sounds True, 2012). The table below is a starting palette. It is a musical reading, credited as Stu's interpretation, not a traditional table. It keeps the Key drone as "home", Nakkach's word for the drone.

| Element | Density | Pulse | Register | Brightness | Movement | Material |
|---|---|---|---|---|---|---|
| Earth | Dense, few events | Slow, steady | Low; strong root and fifth | Dark, warm | Still, centred | Low shruti, stone, soil |
| Water | Continuous | Swells, no hard attacks | Middle | Soft | Glides, slow drift | Stream, rain, waves |
| Fire | Flickering | Quicker, irregular | Upper middle | Bright, overtone-rich | Rising, crackling | Fire, bright reeds |
| Air | Sparse | Breath-paced | High | Breathy | Wide, moving | Wind, breath noise, distant birds |
| Space | Nearly empty | None | Faint, or drone only | Neutral | Long tails into silence | Fading drone, room tone, a bowl decaying |

Web MIDI doesn't work in Safari on iPhone or iPad ([caniuse](https://caniuse.com/midi)). MIDI play-along can ship for Chrome and Edge now, and wait for the native app on Apple devices.

### Open questions

Which rig should ship first, and does Stu want macros (Ableton-style "Calm ↔ Bright") on page one? Should the Breath module ever run without the soundscape, as a plain pacer? HeartMath's trademarks weren't checked, so the module should be named "Coherence breathing" or "Six-a-minute breathing" rather than anything resembling HeartMath product names.

## V2: three composers reduce to six Web Audio building blocks

### Eno, Chilvers and Reich, translated

**Music for Airports** used tape loops of unrelated lengths. In a 1996 talk Eno recalled notes repeating roughly every 23½, 25⅞ and 29 15/16 seconds, so the combinations "don't ever" repeat in the same way ([In Motion Magazine](https://inmotionmagazine.com/eno1.html)). Reverb Machine's measurements of track 2/1 give different loop lengths (around 20 seconds), so treat Eno's figures as recollection rather than a recipe ([Reverb Machine](https://reverbmachine.com/blog/deconstructing-brian-eno-music-for-airports/)). The arithmetic still teaches the lesson: three loops at Eno's lengths wouldn't line up exactly again for about 27 days. **In Web Audio, don't build long buffers full of silence** (a 23.5-second stereo loop costs about 9 MB). Keep only each note's short buffer and start a new one-shot source every `period` seconds. Use periods with no simple ratio between them, such as 17.3, 19.7, 23.5 and 29.9 seconds, and add a few tens of milliseconds of random timing to imitate tape.

**Discreet Music** was two synth melodies of different lengths fed into a long echo loop between two tape recorders. Eno only occasionally adjusted an equaliser and otherwise listened ([KLFM liner notes](https://klfm.org/brian-eno-discreet-music-eg-records-ltd-1975/); [Reverb Machine](https://reverbmachine.com/blog/deconstructing-brian-enos-discreet-music/)). In Web Audio this is a `DelayNode` feeding high-pass and low-pass filters (each repeat a little darker), then a soft saturator, then a feedback gain, and back into the delay. A very slow oscillator adds wow to the delay time. Two traps catch beginners. Any feedback loop must contain a `DelayNode`, or the browser mutes it. And `createDelay` defaults to a 1-second maximum, so a 3–6 second tape echo needs `ctx.createDelay(10)` ([MDN DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode); [MDN createDelay](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDelay)). Keep the feedback control at 0.9 or below, keep filter resonance low, and put a limiter on the master. "Memory" (feedback), "Age" (darkness and wow) and a "Clear" gesture make friendly controls. Fed from the mic, the same loop becomes a live Frippertronics instrument for the voice.

**Peter Chilvers' apps with Eno** set the bar for how much control to give:

- **Bloom** plays when tapped and plays itself when left alone. It has moods, a delay, shake-to-clear and a sleep timer ([Bloom](https://www.generativemusic.com/bloom.html)).
- **Reflection** offers only a pause button. Its rules change with the time of day: brighter harmony in the morning, back to the home key by evening, thinner and slower in the small hours ([XLR8R](https://xlr8r.com/?p=34957)).
- **Air** uses only 12 notes, and Chilvers says the playback engine had to be rewritten five times ([Tape Op](https://tapeop.com/interviews/137/peter-chilvers)).

That suggests three levels of involvement on one screen: Play (Bloom), Arrange (Scape) and Let it be (Reflection).

**Steve Reich's phasing** runs two copies of the same loop, one very slightly faster ([Language Log](https://languagelog.ldc.upenn.edu/nll/?p=3394); [Piano Phase](https://en.wikipedia.org/wiki/Piano_Phase)). In Web Audio this takes one line of code: give the second source `playbackRate = 1.002`. A 2-second loop then drifts all the way round and back to unison in about 17 minutes. *Piano Phase*'s "drift, then lock" is a rate change held for exactly one note's worth of drift. *Clapping Music* is pure scheduling: shift the second part's starting point by one beat every 8 or 12 repeats, so it returns to unison after 12 shifts ([Clapping Music](https://en.wikipedia.org/wiki/Clapping_Music)). The free Third Coast Percussion app already lets users phase their own loops ([CDM](https://cdm.link/play-with-steve-reichs-techniques-in-a-free-iphone-app/)). The most direct V2 demo is to record a phrase in V1, drop it in and press "Phase".

The six building blocks are:

1. virtual tape loops with unrelated periods;
2. `playbackRate` drift;
3. a look-ahead scheduler that makes weighted random choices;
4. a filtered feedback delay;
5. slow modulation running on the audio thread (very slow oscillators, and random walks using `setTargetAtTime`);
6. every pitch derived from the shared Key.

A seeded random generator would make any generative soundscape shareable and replayable from a single number.

### Background tabs will throttle a quiet generative engine

The standard scheduling pattern runs a timer about every 25 ms that books every sound due in the next ~100 ms against the audio clock ([web.dev](https://web.dev/articles/audio-scheduling)). Chrome relaxes its throttling only for pages that have made sound in the last 30 seconds. A hidden, silent page gets timers once a second, and after five minutes, once a minute ([Chrome Developers](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)). **Sparse generative music can fall silent long enough to be throttled.** Three defences:

- book ambient events 2–5 seconds ahead;
- keep one bed layer always audible;
- run slow changes as audio-thread automation rather than timer callbacks.

On phones, keep one shared reverb (V1 already does), cap simultaneous one-shots at around 16–24, and prefer `StereoPannerNode` to the costlier HRTF panner.

### Krause's spectrogram becomes a "room for the voice" score

Krause divides a soundscape into **geophony** (wind, water), **biophony** (living creatures) and **anthrophony** (human noise). These terms became the framework of soundscape ecology in a 2011 *BioScience* paper he co-wrote ([Pijanowski et al. 2011](https://bioone.org/journals/bioscience/volume-61/issue-3/bio.2011.61.3.6/Soundscape-Ecology-The-Science-of-Sound-in-the-Landscape/10.1525/bio.2011.61.3.6.full)). His **niche hypothesis**, first published in 1993 ([Wikipedia: Acoustic ecology](https://en.wikipedia.org/wiki/Acoustic_ecology); [SFU World Soundscape Project](https://www.sfu.ca/sonic-studio/WSPDatabase/AnalysisDVD/Acoustic%20Space/niche5.htm)), holds that in old, undisturbed habitats each species' voice finds its own band of pitch or slot of time, so a spectrogram looks like an orchestral score, and that this structure breaks down when a habitat is damaged. In *The Great Animal Orchestra* (2012) he reads spectrograms as scores and looks for density, diversity and clean separation. He candidly calls his conclusion that voices evolved together "an educated guess".

Later research gives **partial, mixed support**:

- A 2026 preprint review finds that about two-thirds of studies report partitioning, but with a strong bias toward frogs and little testing of the core assumptions ([bioRxiv](https://www.biorxiv.org/node/5418808)).
- Australian frog choruses overlap in frequency less than chance would predict ([PMC9748494](https://pmc.ncbi.nlm.nih.gov/articles/PMC9748494/)).
- Tropical forest birds separate mainly by **timing**, not pitch ([Frontiers 2021](https://www.frontiersin.org/articles/10.3389/fevo.2021.753363)).
- A large meta-analysis found no consistent support for the related idea that habitat shapes calls ([Freitas et al. 2025](https://www.biorxiv.org/content/10.1101/2024.02.21.581368.full.pdf)).

The single numbers ecologists compute from spectrograms ("acoustic indices") track biodiversity only moderately (r ≈ 0.33 across 34 studies) ([Alcocer et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9804652/)). Two of them still make good *design* tools. The Acoustic Diversity Index measures the share of each frequency band above a threshold ([soundecology](https://archive.linux.duke.edu/cran/web/packages/soundecology/vignettes/intro.html)). NDSI is a −1 to +1 ratio of energy in two band groups ([seewave](https://rug.mnhn.fr/seewave/HTML/MAN/NDSI.html)). The closest artistic precedent is the composer David Monacchi, whom Krause describes improvising into the free time-and-frequency gaps of a rainforest recording while watching a live spectrogram.

**Build the editor in this order:**

1. Display: the wavesurfer.js spectrogram plugin gives log or mel scales, colour maps and Web Worker support out of the box ([wavesurfer.js](https://wavesurfer.xyz/docs/types/plugins_spectrogram.SpectrogramPluginOptions)).
2. A rectangle overlay that stores selections as `{t0, t1, f0, f1, gainDb}`.
3. In a worker, apply those rectangles as a soft mask to a short-time Fourier transform of the loop, then rebuild the audio with Hann windows at 50% or 75% overlap, the standard choice for clean reconstruction ([J.O. Smith, SASP](https://www.dsprelated.com/freebooks/sasp/Overlap_Add_OLA_Interpretation_STFT.html)). Keep the original audio and the list of rectangles so every edit is undoable.
4. A live "room" meter.

Use a log (musical) frequency scale labelled with the Key's note names. Use Meyda for Bark-band loudness ([Meyda](https://meyda.js.org/audio-features)). Avoid essentia.js unless the AGPL licence is acceptable ([ISMIR 2020](https://program.ismir2020.net/poster_4-18.html)).

To define the voice's region, use these bands:

- the fundamental, depending on voice type;
- F1, about 300–750 Hz, and F2, about 900 Hz to 3 kHz and above ([SFU Handbook](https://www.sfu.ca/sonic-studio-webdav/handbook/Formant.html));
- the singer's formant around 2.5–3.5 kHz ([VoceVista](https://www.vocevista.com/en/doc/theory-resonances/)).

"Room for the voice" is then the percentage of time-and-frequency cells in that region where the soundscape sits below the singer's level minus a margin. Report pitch room and time room separately ("2–4 kHz is 70% full, but free every other second"). Score the shruti drone separately, since it accompanies the voice rather than competing with it. No published measure of this exists, so the score is original to Soundscape and should be tuned by ear on real takes. In the app's own text, present the niche idea as Krause's influential, partly supported hypothesis. For the listening mode, the Fondation Cartier installation with United Visual Artists offers a second model: spectrograms projected as an immersive landscape with no axes ([UVA](https://www.uva.co.uk/features/great-animal-orchestra-cartier-foundation)).

### Session arcs are phases of function, not volume curves

Wavepaths builds a session as a sequence of "waves". Each wave has one of six functions (soothing, deepening, releasing, bridging, holding, quieting), an emotional climate (stillness, vitality, bittersweet, tension) and an intensity, with 13 steps available live. Changes happen "seamlessly", within 60 seconds of an instruction ([Wavepaths](https://wavepaths.com/music-for-care-providers); [Starter Toolkit](https://wavepaths.com/?p=4909)). The wider music-therapy idea behind such arcs is the **iso principle**: meet the listener's current state, then move in small steps. The evidence for it is modest, and controlled comparisons are rare ([Sonicfield summary](https://sonicfield.org/library/personalised-affect-regulation-playlists-a-pre-registered-experimental-test-of-t)).

For transitions between scenes, the audio maths is settled. **Two different field recordings are uncorrelated, so an equal-power crossfade (sine and cosine curves, each −3 dB at the midpoint) keeps loudness steady.** A linear fade dips in the middle, and is right only for a loop crossfading with itself at its seam ([Fink, Holters & Zölzer, DAFx 2016](https://www.hsu-hh.de/ant/wp-content/uploads/sites/699/2017/10/Fink-Holters-Z%C3%B6lzer-2016-Signal-matched-power-complementary-cross-fading-and-dry-wet-mixing.pdf)). Ecology adds texture. Dusk birdsong is sparser and quieter than dawn song ([Animals 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10886165/)), and insect choruses build as the birds stop, with species dividing frequency and time almost without overlap ([IISc 2014](https://eprints.iisc.ac.in/48315)). So a day-to-evening move should **stagger rather than swap**:

1. darken and thin the birds over 1–3 minutes;
2. hold a river or wind bed steady underneath, to carry the energy;
3. bring the crickets in late and let them build slowly.

Game audio does the same thing with "blend containers" driven by a time-of-day value ([CRYENGINE/Wwise docs](https://cryengine.com/docs/static/engines/cryengine-5/categories/23756816/pages/44964992)). It also breaks long ambiences into randomised chunks so the loop never becomes audible ([CRI Middleware](https://blog.criware.com/index.php/2020/12/14/ambience-design-in-atom-craft-part-1-2/)). For timing, `setTargetAtTime` reaches about 95% of its target after three time constants, so set the time constant to the fade length divided by 3 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime)).

An arc can be stored as `{length, phases: [{startFrac, endFrac, function, scene, intensity, brightness}]}`. Phase lengths are fractions of the total, so one shape fits 20 or 90 minutes. Transition lengths are fixed in seconds (30–90 seconds per layer), so a short session doesn't get a six-minute fade. Four starter shapes would cover most uses:

- *Arrive, settle, deepen, return* (for yoga and bodywork);
- *Dawn to dusk*;
- *Descend into sleep*;
- *Steady hold* (for talk therapy).

Avoid big crescendos in calming phases; Endel's science notes link crescendo-heavy music with rises in heart rate and breathing ([Amazon Science](https://www.amazon.science/latest-news/the-science-behind-endels-ai-powered-soundscapes)).

### Open questions

The exact rules of the Eno and Chilvers apps aren't published, so all the patterns above are reconstructions. No study gives cricket-onset times relative to sunset, and Krause's own recordings in the Archive may be the best guide. The room-for-the-voice thresholds (−50 dBFS, a 10 dB margin) are illustrative and need tuning with real singers. Would the Five Elements order (earth to space) make a good arc? Check it against a Bön teacher before claiming it follows the tradition's order of dissolution.

## V3: a calm player and a chest strap, not a ring, for live biofeedback

### Client mode

Wavepaths separates a *planner* (template, length, timbre, intensity) from a *session screen* with an intensity slider, climate changes, hold/extend, skip and silence. It also offers remote streaming, offline caching and an integration page after each session ([Wavepaths](https://wavepaths.com/music-for-care-providers)). It charges by **hours of music**, from about $30 to $200 a month, though the vendor's two pricing tables conflict. Its founder, the neuroscientist Mendel Kaelen, started it after PhD work at Imperial College on music in psychedelic therapy ([OPEN Foundation](https://open-foundation.org/2022/09/14)). Its users include breathwork and bodywork practitioners, not only psychedelic clinics.

Soundscape's client mode can be one screen:

- **Before the session:** choose a Shape (four or five named arcs), a Length (20 to 90 minutes) and, optionally, a Key, then press Begin.
- **During the session:** a quiet progress ring showing the phase name ("Settling – river"), plus Hold (freeze the arc clock), Next (move on over 30–60 seconds), Quieter/Fuller, and End (a bell, then a fade).

Show the wall-clock end time. Creative Living is the first proposal, and this screen is the proof of concept.

### Which biofeedback devices can talk to the app

| Device | Live during a session? | Web app on iPhone | Web app in Chrome (desktop, Android) | Capacitor on iPhone | Notes |
|---|---|---|---|---|---|
| **Bluetooth chest strap** (Polar H10 or any standard 0x180D strap) | **Yes: heart rate plus beat-to-beat (RR) intervals** | No | Yes, via Web Bluetooth | Yes, via the bluetooth-le plugin | No account, cloud or licence. RR intervals arrive in 1/1024 s units ([SimpleBLE](https://docs.simpleble.org/recipes/heart-rate-monitor)). Some cheap straps fake RR ([Rutenberg 2026](https://www.guyrutenberg.com/2026/04/04/web-hr-monitor-heart-rate-and-hrv-in-the-browser/)). |
| **Whoop heart-rate broadcast** | Heart rate yes; RR unknown | No | Likely, as a standard strap | Yes | Must be switched on in the Whoop app. Reports on Whoop 5.0 are inconsistent ([Whoop community](https://www.community.whoop.com/t/broadcast-heartrate-hr-not-working-with-wahoo-elemnt/6590)). |
| **Whoop cloud API v2** | No: per-sleep and per-day summaries | Needs a small server for sign-in | Same | Same | Recovery, HRV (RMSSD), sleep stages. No heart-rate time series ([Whoop API](https://developer.whoop.com/api)). |
| **Oura API v2** | No: data can lag hours | Needs a small server for sign-in | Same | Same | Needs an Oura membership ([Oura support](https://support.ouraring.com/hc/en-us/articles/4415266939155-The-Oura-API)). Reportedly capped at 10 users until Oura approves the app, and data may not be passed to AI models ([Terra summary](https://tryterra.co/blog/oura-api-ai-apps-access-permissions-commercial-restrictions)). |
| **Muse EEG headband** | Yes | No | Via `muse-js` (unmaintained) | Official SDK in a custom plugin | The SDK is free for art and prototypes; selling needs a commercial licence ([Muse developers](https://choosemuse.com/pages/developers)). Mind Monitor streams OSC over Wi-Fi to a laptop ([Mind Monitor](https://musemonitor.com/)). |
| **HeartMath Inner Balance** | Only inside HeartMath's app | No | No | No public SDK | Can run in the background alongside Soundscape ([HeartMath FAQ](https://heartcloud.com/library/inner_balance_faqs.html)). |
| **Apple Watch / HealthKit** | Not reliably | No | No | HealthKit plugin for history; live data needs a watch app | HealthKit stores HRV as SDNN, which doesn't compare directly with Oura or Whoop RMSSD ([Apple forums](https://developer.apple.com/forums/thread/123345)). |

**The chest strap is the first and best live source.** One piece of code (standard service 0x180D, characteristic 0x2A37) covers Polar, Garmin, Wahoo and Whoop broadcast. From the RR intervals Soundscape can compute its own six-a-minute rhythm measure, under its own name rather than HeartMath's. Oura and Whoop suit a morning "how did you sleep" suggestion of which arc to play, not real-time response. Both use OAuth sign-in, which needs a client secret kept on a server, so a static GitHub Pages site needs a tiny serverless function (a Cloudflare Worker, for example). Capacitor doesn't remove that need. For installations, Muse plus Mind Monitor plus a laptop running Max or Ableton is the fastest no-code route. A browser can't receive raw OSC, so it would need a small OSC-to-WebSocket bridge.

### Regulation decides the wording, not the code

**Under the FDA's January 2026 general-wellness guidance, software that plays music to "soothe and relax" or coaches breathing for relaxation is not a medical device.** Claims to treat a condition such as an anxiety disorder are a different matter ([FDA guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)). The guidance also allows a softer, healthy-lifestyle claim of the form "may help living well with" a condition. In the EU, the stated intended purpose decides whether an app counts as medical. Software that monitors physiological processes for a medical purpose falls into Class IIa or higher ([OpenRegulatory on MDCG 2019-11](https://openregulatory.com/mdcg/mdcg-2019-11); [mdrregulator.com](https://mdrregulator.com/news/revised-mdcg-2019-11-guidance-updated-approach-to-qualification-and-classification-of-medical-software)). The moment a heart reading appears in client mode, the wording has to stay in relaxation and practice language. Get regulatory advice before marketing to therapists for clients with diagnoses.

### Open questions

Does the Inner Balance sensor expose the standard heart-rate service to other apps? A quick scan with the free nRF Connect app would answer it. Does Whoop's broadcast include RR intervals? What are the Muse commercial-licence terms? Advertising-standards rules (the US FTC, the UK ASA) and the App Store's health-app policies weren't researched, and they are likely the practical constraint on marketing copy.

## Horizon: three lineages, three separate tables, one credit line

### Bön: the elements, the syllables and the space after Tsalung

Tenzin Wangyal Rinpoche's *Healing with Form, Energy and Light* (Snow Lion, 2002) teaches the five elements at three levels:

- **outer (shamanic):** through nature and the beings tied to it;
- **inner (tantric):** five energies balanced through movement, breath and visualisation;
- **secret (Dzogchen):** the elements as the radiance of awareness ([Shambhala](https://www.shambhala.com/healing-with-form-energy-and-light-2243.html)).

The tantric level maps most naturally onto sound qualities. The Dzogchen level is best honoured by leaving space and silence. **Bön sources do not agree on a single colour-and-syllable table**, and one states that colours vary with the teaching cycle ([Kharnatsang](https://www.kharnatsang.com/?p=577)):

| Syllable | Kharnatsang (Menri recording) | Namchu Wangden cycle, via Raven Cypress Wood |
|---|---|---|
| AH | Space, blue | Earth, golden |
| YANG | Air, white | Wind, green |
| RAM | Fire, red | Fire, red |
| MANG | Water, green/turquoise | Water, blue |
| KHAM | Earth (mineral), dark yellow | Iron, white |
| DRUM | Earth (mountains), light yellow | (not listed) |

Sources: [Kharnatsang, Mantra of the Five Elements](https://www.kharnatsang.com/?p=577); [Raven Cypress Wood, Cycles of the Elements and Time](https://ravencypresswood.com/2018/06/30/3942). Rinpoche's own table in *Healing with Form, Energy and Light* wasn't available online. Check it in the book before using any colours.

Ligmincha teaches the five **warrior syllables** (A, OM, HUNG, RAM, DZA) openly through public webinars. They relate to body, speech, mind, qualities and action, not directly to the elements ([Ligmincha webinar](https://ligmincha.org/events/tibetan-sound-healing-live-webinar/); [Spirituality & Practice review](https://www.spiritualityandpractice.com/book-reviews/view/16429/tibetan-sound-healing)). In Ligmincha's trul khor teaching, practitioners release all effort after each movement to touch inner stillness and silence, and come away "more spacious and clear". The practice is **not recommended for people with uncontrolled high blood pressure, glaucoma or dissociative disorders** ([Ligmincha](https://ligmincha.org/?p=49065)). The 3 Doors' tsa lung instructions are copyrighted, for programme use only, and ask not to be copied, so this report doesn't summarise them. **The sound for "the space after the Tsalung" should support resting rather than lead it:**

- already present when the movement ends, never starting abruptly;
- no melody, words or pulse;
- a very low drone in the Key, or room tone, thinning toward silence;
- its length set by the teacher or the practitioner.

The Five Elements "Space" mode above does exactly this. Any idea of tilting register to match a movement's direction (a rising shimmer after an upward-moving breath, for example) is Stu's artistic reading, and should be labelled that way.

**"Soul retrieval" (*la lu*) is a living Bön ritual term.** Rinpoche teaches it publicly through *The True Source of Healing* (Hay House, 2015), which describes the soul as made of the five elements and retrieval as reconnecting with their essences in nature ([Windhorse Books](https://windhorse.com.au/9781401944490-true-source-of-healing.html); [Dharmalaya Institute](https://dharmalaya.in/articles/retrieving-the-elemental-essences-from-nature)). The roadmap's phrase "retrieving the elemental essences" is already his public wording. That is a reason to credit him by name and to ask Ligmincha before using "Soul Retrieval" as the title of rooms that a Bön teacher doesn't lead. "Elemental Rooms" or "Rooms of the Five Elements" are safe working titles.

### Buddhist (Maitri Space Awareness): the closest precedent for coloured rooms

Chögyam Trungpa's Maitri Space Awareness, introduced in 1972, comes from the Tibetan Buddhist and Shambhala world, not from Bön. Practitioners hold a set posture in each of five rooms, each built with its own colour, light and window shape. Trungpa developed it for people recovering from extreme states, and for their therapists ([Windhorse Legacy Project](https://windhorselegacyproject.org/legacy-project-archives/2022-maitri-video); [Contemplative psychotherapy](https://en.wikipedia.org/wiki/Contemplative_psychotherapy)).

| Family | Direction | Colour and light | Window | Element |
|---|---|---|---|---|
| Vajra | East | Deep blue, crystalline | Slit | Water |
| Ratna | South | Yellow, warm gold | Large round | Earth |
| Padma | West | Red, glowing | Large rectangle | Fire |
| Karma | North | Green, light from above | Light from the apex | Wind |
| Buddha | Centre | Flat white, muted | (not specified) | Space |

Source: [Windhorse Legacy Project](https://windhorselegacyproject.org/legacy-project-archives/2022-maitri-video). Maitri places water with blue and wind with green. One Bön table gives air white and space blue. Never merge the two. Maitri's working principle is useful for sound design: exaggerate one quality so both its healthy and its neurotic sides can be noticed. That suggests each element's sound should be allowed to be a little too much of itself.

### Silvia Nakkach: drone as home, silence after sound

In *Free Your Voice* (Sounds True, 2012), Nakkach treats the drone as the voice's home, where it rests between phrases. She ends each toning exercise by resting in silence and listening to the vibration afterwards, and she links the practice of sound to space and the moving voice to water. Her seed-syllable list for the elements, which she labels only "Tibetan" (E for space, YAM air, BAM water, RAM fire, LAM earth), **is not the Bön list above**. She also gives a separate Hindu chakra list, and tells readers that other sources give other correspondences. She draws on Rinpoche's warrior syllables, Nada Yoga and Dhrupad, which she calls the oldest living Hindustani vocal form, sung largely on seed syllables over a drone. Her exercise of matching the drone's root until voice and drone sound like one, then leaving and returning, is the core of what Soundscape already does when a singer records over the shruti.

### What it means for the app and the rooms

Soundscape should **accompany these practices, not teach them**. It can supply a drone in the Key, an element ambience, and a rest timer for practice led by Stu, a Ligmincha instructor or the practitioner. It should not give step-by-step syllable or movement instructions, use recorded teachers' voices without permission, or show a merged correspondence table. Wherever a traditional table appears, name its source. Colour can follow the sound rather than being fixed: Nakkach quotes a Tibetan cosmology in which sound becomes light, then coloured rays, then elements. A teacher could choose a Bön palette, a Maitri palette or a neutral one, each with its credit. A credit line for the module and the rooms:

> The Five Elements module is inspired by the Bön teachings of Tenzin Wangyal Rinpoche (Ligmincha International), the Maitri Space Awareness practice of Chögyam Trungpa, and the Yoga of the Voice of Silvia Nakkach (Vox Mundi). The sound interpretations are Stu Pender's own and are not a transmission of these practices.

### Open questions

Ligmincha and The 3 Doors have no published policy on artists or apps using their practices or terms, so ask them directly. The same applies to Nakkach for Yoga of the Voice material. Rinpoche's own colour table, Maitri postures and room durations, and Dhrupad ālāp syllables all need primary sources before anything appears on screen. The Horizon's reference to Dr Jack Kruse's biophysics wasn't researched here, and it should go through the same claims check as everything else.

## Claims the app must not make

These rules apply to on-screen text, the website, store listings and any proposal to Creative Living or funders, because regulators judge intended use from all of them ([FDA](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)).

| Don't say | Why | Say instead |
|---|---|---|
| "Treats / reduces / cures anxiety, insomnia, depression, PTSD, ADHD, high blood pressure, tinnitus, pain" | A disease claim makes it a medical device (FDA; EU MDR). | "A breathing companion for relaxation and stress management." |
| "Clinically proven", "therapy", "therapeutic", "medical-grade" | Not true of the app, and it implies a medical purpose. | "Inspired by long-standing breathing and listening practices." |
| "Brainwave entrainment", "theta for meditation", "delta for deep sleep", "syncs your brain" | EEG evidence is split, and the beats failed whenever embedded in noise ([Ingendoh 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/)). | "Two tones a few hertz apart, one in each ear, heard as a slow pulse. Use headphones. Research on their effects is mixed; enjoy them as a texture." |
| "Your coherence score", "measures your HRV / stress", "your heart is in coherence" | The app has no sensor (until V3), and "coherence" scoring is HeartMath's method. | "Slow, even breathing, about six a minute. This app does not measure your heart." |
| "Lowers blood pressure / cortisol", "increases HRV by X%", "improves heart health" | A physiological outcome stated as fact; RESPeRATE's effect vanished in independent trials. | "Slow breathing is a long-standing relaxation practice." On an "About the science" page, with citations: "Research has found changes in heart rhythm during slow breathing." |
| "Cures insomnia", "deeper sleep", "increases deep sleep" | Evidence is low-certainty; pink-noise results came from stage-timed noise. | "A sound environment to help you wind down." / "Fades out gently over 30 minutes." |
| "×7 better focus" or other Endel or vendor numbers | They come from a study run by a partner company ([bioRxiv](https://www.biorxiv.org/content/10.1101/2021.04.02.438269v1.full.pdf+html)). | Describe what the sound does, not a percentage. |
| "Healing frequencies", "432 Hz / 528 Hz heals" | Unsupported mechanism claims of the same kind. | Name the Key and the tuning plainly. |
| "Balances your chakras", "heals", "purifies the elements" | A health claim, and it presents a tradition's metaphysics as fact. | "For practice", "to rest in", "to listen with". |
| "The Bön colours of the elements" | Bön sources disagree, and Maitri differs again. | "Colours after [named source]; colours vary between teaching cycles." |
| "Soul Retrieval rooms" (without a Bön teacher) | A living ritual term with lineage holders. | "Elemental Rooms (after Tenzin Wangyal Rinpoche's teaching on the elemental essences)". |
| "HeartMath coherence" in a module name | Their trademarks weren't checked; they offer no partnership route. | "Coherence breathing" or "Six-a-minute breathing, inspired by the 365 practice popularised by Dr David O'Hare". |

Use this standard disclaimer: "Soundscape is for relaxation and creative practice. It is not a medical device and is not intended to diagnose, treat, cure or prevent any disease. If you have a medical or mental-health condition, talk to a professional." Add these practice cautions where they apply: breathe gently and return to normal breathing if dizzy; never use while driving; check with a doctor before rhythmic sound if you have epilepsy (a precaution: no clinical data was found); keep volume low, especially with headphones and overnight. For movement practices, add that they are led by a qualified teacher and carry Ligmincha's stated contraindications.

## Conclusion

The research's biggest shift is from *what the soundscape plays* to *how much room it leaves*. Krause's niche idea, the Bön and Nakkach emphasis on silence after sound, Maitri's single-quality rooms, Reflection's near-total lack of controls and the iso principle all point the same way. The app is at its best when it holds a steady home (the Key drone), moves slowly, and leaves time and frequency open for a voice, a breath or a rest. That gives Soundscape a distinctive position, between FFOSSO's playfulness and Wavepaths' clinical arcs: **a soundscape that measures and protects space for the person in it**, rather than one that claims to change their brain.

The second lesson is about sequencing. Almost every feature that makes the vision feel alive on an iPhone needs native code: live biofeedback, MIDI, locked-screen sessions and clean Bluetooth recording. The parts that make it *good*, though, are pure web and can start now: the module contract, the six generative building blocks, equal-power staggered transitions, and a room-for-the-voice score. Build those on the web, let the first real need for a strap or an hour-long locked session trigger the Capacitor move, and let the claims table do as much work as the code. In this field, the wording is what keeps the app a musical instrument rather than a medical device.
