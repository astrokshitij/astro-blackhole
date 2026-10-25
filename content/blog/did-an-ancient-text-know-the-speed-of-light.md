---
title: Did an Ancient Text Know the Speed of Light? I Checked the Paper's Numbers
excerpt: A new peer-reviewed paper looks at a line in Sayana's Rigveda commentary that is often linked to the speed of light. I checked its calculations, its sources and the assumptions behind its choice of units.
category: Investigation
readTime: 13 min
date: 2026-10-25
draft: false
topics:
  - Speed of light
  - History of astronomy
  - Indian astronomy
  - Units of measurement
  - Scientific peer review
cover: /images/blog/sayana-audit/cover.webp
ogImage: /images/blog/sayana-audit/cover-og.jpg
coverAlt: The line 2,202 yojanas in half a nimesa, the formula speed equals 4404 times Y divided by N, and a number line showing the paper's 16 results scattered around the speed of light
quote: "“A close match is only as strong as the reason for choosing the units behind it.”"
summary:
  - The printed speed arithmetic holds up. All 16 tabulated calculations reproduce from their printed inputs, to the displayed rounding.
  - The choice of units needs more justification. In one case, picking between two values listed in the paper decides whether a result is about 7% or about 25% away from the modern speed of light.
  - The calculations do not establish a proven ancient determination of the modern speed of light, and the paper itself acknowledges that limitation.
---

Ever since I was 14 years old, I have often heard that the speed of light was mentioned in our ancient texts. It always made me curious. But when I started studying physics, I began to grow sceptical.

So when a peer-reviewed paper on exactly this question came out in August 2026, I wanted to know two things. What does the ancient statement actually say? And what does this modern paper actually establish?

The paper is by Kartik Iyer, Mohit Gour and Govind Maurya, published in the *Proceedings of the Indian National Science Academy*. I wanted to understand what it had actually established, so I checked its calculations, its sources and the assumptions behind its choice of units.

## What the Paper Actually Says

The statement comes from Sayana, a 14th-century scholar who wrote a famous commentary on the Rigveda. While explaining a hymn to the Sun, he quoted a traditional line: the Sun travels 2,202 yojanas in half a nimesa.

A **yojana** is an old unit of distance. A **nimesa** is a very short unit of time, often described as the blink of an eye.

![The line from Sayana's commentary as printed in the paper, with the translation and the note that it is not present in the Rigveda highlighted](/images/blog/sayana-audit/fig01_sayana_quote.webp)

*Figure 1: The line quoted in Sayana's commentary, and the paper's note that it is not part of the Rigveda itself. (Iyer, Gour & Maurya 2026, p. 3)*

The paper gets an important point right from the start. This number is not a verse of the Rigveda. It appears in Sayana's commentary, quoted as something traditionally remembered.

The authors collect different values for the yojana and the nimesa from old texts, combine them into 16 possible speeds, and compare each with the modern speed of light, 299,792.458 km/s. They report results that are too low as well as too high, keep several explanations open (a number tradition, a symbolic idea, or coincidence), and end carefully.

![The paper's final paragraph, with its statement that it does not claim a definitive or experimentally established determination of the speed of light highlighted](/images/blog/sayana-audit/fig14_final_limitation.webp)

*Figure 2: The paper's own limitation, in its final paragraph. (Iyer, Gour & Maurya 2026, p. 12)*

So the paper does not claim that ancient India measured the speed of light. Its claim is narrower: under certain assumptions, some traditional numbers come out close to the modern value. That narrower claim is what I checked. To check it, we first need to see how the calculation works.

## How the Calculation Works

"2,202 yojanas in half a nimesa" is a speed. To turn it into kilometres per second, we need two conversions:

- **Y** = how many kilometres are in one yojana
- **N** = how many seconds are in one nimesa

The distance is 2,202 × Y kilometres. The time is half a nimesa, or N ÷ 2 seconds. Speed is distance divided by time:

**Speed = 2,202 × Y ÷ (N ÷ 2) = 4,404 × Y ÷ N** (km/s)

The 4,404 is just 2 × 2,202. It already takes care of the "half", so you divide by the full nimesa.

So the answer depends entirely on which conversions you choose. A bigger yojana gives a bigger speed; a longer nimesa gives a smaller one.

To compare each answer with the real speed of light, the paper uses a **percentage difference**: how far the answer is above or below the real value, as a share of that value. +6% means 6% too high. −15% means 15% too low.

So everything rests on Y and N. Where do they come from?

## Turning a Yojana into Kilometres

The paper finds the length of a yojana using **calibration**: checking an unknown measuring scale against something whose size you already know.

Imagine you find an old ruler with markings you don't recognise. You know the table it was used to measure is 2 metres long, and the old ruler says the table is 10 units. Then each unit must be about 20 cm.

The paper does the same with Earth. Old astronomy texts give Earth's size in yojanas. Compare that with Earth's modern size, and you get kilometres per yojana:

**km per yojana = modern Earth size in km ÷ historical Earth size in yojanas**

![The paper's calibration method, with its stated Earth radius of 6,437 km highlighted](/images/blog/sayana-audit/fig03_earth_radius_method.webp)

*Figure 3: The calibration method. (Iyer, Gour & Maurya 2026, p. 5)*

This is a reasonable method, and using modern measurements of Earth is not cheating. But it gives a conditional estimate, with three limits:

- It assumes the old text's Earth size can work as a ruler.
- It tells us the yojana used in that astronomy text. It doesn't tell us which yojana Sayana's line had in mind.
- A ruler set using Earth will, of course, get Earth right. That part is not an independent check.

With the method clear, let's look at the results.

## The Arithmetic Holds Up

I recalculated all 16 speeds in the paper's Tables 3 to 5, using the printed inputs. Every one reproduces, to the displayed rounding. The full list is in the appendix.

![Table 3 of the paper, showing twelve speed calculations](/images/blog/sayana-audit/fig07_table3.webp)

*Figure 4: Twelve of the 16 tabulated speeds. (Iyer, Gour & Maurya 2026, p. 7, Table 3)*

![Tables 4 and 5 of the paper, with the Manusmriti result and the Table 5 inputs and results highlighted](/images/blog/sayana-audit/fig08_tables4_5.webp)

*Figure 5: The other four, including the closest of the 16, the Manusmriti row. (Iyer, Gour & Maurya 2026, p. 8, Tables 4 and 5)*

Among these 16 results, the closest is the row labelled Manusmriti. It uses a yojana of 12.87 km and a nimesa of 0.1778 s:

**4,404 × 12.87 ÷ 0.1778 ≈ 318,782.227 km/s**, about **6.334% above** the modern value.

The paper reports exactly this and calls it a slight overshoot. Its review of earlier work also mentions closer claimed matches, such as Kak's 314,445.6 km/s (about 4.9% above), so "closest" here means closest among the 16 in the tables.

So the division is not the problem. The real questions are about the inputs: where each Y and N comes from, and why they belong together. I'll start with the issues that matter most, because they affect which units are chosen.

## Where the Units Come From

For each issue, I've set out what the paper says, what I checked, what the result shows, and what it doesn't show.

### 1. Two Arthashastra yojanas, two very different answers

**What the paper says.** The paper's Table 1 lists two yojana values connected to the Arthashastra, an ancient text on statecraft. One is 12.3 km, labelled "Arthashastra". The other is 15.23 km, labelled "Archaeological Studies (Dholavira)". On page 4, the paper links the larger value to the Arthashastra through an archaeological reading by Kak. Table 4's Arthashastra row then uses 15.23 km.

![Table 1's two Arthashastra-related yojana values, 15.23 km and 12.3 km, and Table 4's Arthashastra row using 15.23 km, highlighted](/images/blog/sayana-audit/v3_arthashastra_choice.webp)

*Figure 6: Two values in Table 1, and the one used in Table 4. (Iyer, Gour & Maurya 2026, p. 5, Table 1 and p. 8, Table 4)*

**What I checked.** The two values come from two different recipes, both described in the paper.

![Two passages from the same page: 8,000 dhanus of 108 angulas, and a yojana of 768,000 angulas, highlighted](/images/blog/sayana-audit/fig15_length_ladder.webp)

*Figure 7: Two recipes on the same page. (Iyer, Gour & Maurya 2026, p. 4)*

The larger value uses 8,000 dhanus of 108 angulas each, with an angula (roughly a finger's width) of 1.763 cm. The smaller value uses 768,000 angulas, which is 8,000 dhanus of 96 angulas, with an angula of 1.6 cm. The different number of angulas per dhanus accounts for 12.5%, and the different angula size for about 10%. Together, they explain the whole gap between 12.3 and 15.23 km.

Using the Arthashastra's own time unit of 0.24 s, the choice makes a big difference:

**Table 1: The two Arthashastra-related yojanas, with the same 0.24 s nimesa.**

| Yojana in the paper | How it is built | Speed | Difference from c |
|---|---|---|---|
| 15.23 km (used in Table 4) | 8,000 × 108 angulas of 1.763 cm | 279,470.5 km/s | about −6.8% |
| 12.3 km (labelled Arthashastra in Table 1) | 768,000 angulas of 1.6 cm | 225,705 km/s | about −24.7% |

The first row is the paper's published result. The second is my check of the alternative the paper itself lists. The authors did not publish it.

**What it shows.** One choice of units decides whether this row looks close to the speed of light or not. The paper needs to explain why the archaeological value is the right one for Sayana's line, and how it fits with the 12.3 km value in its own table.

**What it doesn't show.** The archaeological reading may well be justified, and page 4 does give a reason for it. Nothing here shows the authors picked numbers to fit: they publish results far above c and reject an earlier calculation that came closer (p. 10). The point is simply that a better match can't, by itself, show a choice was historically correct.

### 2. Where the closest row's yojana comes from

**What the paper says.** The 12.87 km yojana in the closest row is credited to Ganganath Jha, writing on Manu 8.406. Jha equates one yojana with 8 miles.

![The paper's statement that Jha, on Manusmriti verse 8.406, says one yojana equals 8 miles, which gives 12.87 km, and the matching Table 1 row](/images/blog/sayana-audit/v2_jha_manu.webp)

*Figure 8: The source of the 12.87 km yojana. (Iyer, Gour & Maurya 2026, p. 4 and p. 5, Table 1)*

**What I checked.** Manu 8.406 is about boat fares on long river journeys. In Jha's English rendering of the commentary on this verse, the words "8 miles" appear in brackets after "one yojana". The Sanskrit commentary at that point talks about one and two yojanas but gives no conversion into miles or any other unit.

**What it shows.** The cited passage, on its own, does not establish an ancient pair of length and time units that were independently calibrated and that apply to Sayana's statement.

**What it doesn't show.** The authors are open that the value comes from Jha. I'm not saying the 8-mile figure is wrong, or that no support for it exists elsewhere, and this says nothing against Manu's time units. The question is what else supports this conversion, and why it applies to Sayana's line.

### 3. An Earth size that doesn't match its cited source

**What the paper says.** For the Surya Siddhanta, an important astronomy text, the paper takes Earth's circumference as 4,800 yojanas, citing Burgess's English translation. From this it gets about 8.35 km per yojana.

![The paper's statement that in the Surya Siddhanta Earth's circumference is 4800 yojanas, giving 8.35 km per yojana, and the matching Table 1 row](/images/blog/sayana-audit/v2_ss_4800_passage.webp)

*Figure 9: The 4,800-yojana circumference and the 8.35 km yojana. (Iyer, Gour & Maurya 2026, p. 4 and p. 5, Table 1)*

**What I checked.** In Burgess's translation, verse I.59 (printed page 43) gives Earth's diameter as 1,600 yojanas. Its rule for the circumference is the square root of ten times the diameter squared:

**1,600 × √10 ≈ 5,059.64 yojanas**, so about **5,060**, not 4,800.

Venugopal and colleagues, in a study the paper itself cites, use this same Burgess figure for the Surya Siddhanta. They also note that 4,800 yojanas appears in other works, including Brahmagupta's *Khandakhadyaka* and Bhaskara II's *Karanakutuhala* (Venugopal et al. 2019, printed p. 403).

**What it shows.** The cited source and the number used don't match. This matters because the circumference is the starting point of the calibration. Change it, and the kilometre value of the yojana changes before any speed is calculated.

**What it doesn't show.** It doesn't mean 4,800 was made up, since related traditions genuinely use it. The paper needs to name the source it is following, or correct the citation. To be fair, using about 5,060 would make that yojana a little smaller and move that row's speed somewhat closer to the modern value, though still above it.

### 4. Does a bigger unit make a better fit?

**What the paper says.** The paper sets aside the smaller yojana values, saying that astronomy needs larger, more consistent units.

![The paper's statement that smaller yojana estimates are disregarded as unsuitable for astronomical contexts where larger units are required, highlighted](/images/blog/sayana-audit/v2_smaller_yojanas.webp)

*Figure 10: (Iyer, Gour & Maurya 2026, pp. 4 and 5)*

**What I checked.** Whether physics needs a large unit to describe a large speed.

**What it shows.** It doesn't. The speed of light is the same whether you write it in kilometres or millimetres per second. The size of a unit can't tell us which unit a text meant. A rule for choosing between yojanas has to rest on which meaning applies to Sayana's quotation, and physics can't decide that.

**What it doesn't show.** The difference between local and astronomical yojanas could still be real. It just needs historical evidence, not the size of the unit, to support it.

These four issues are about which units get chosen. The next three are smaller, but they still affect how easily someone else can reproduce the work.

## Smaller Inconsistencies in the Inputs

### Which modern Earth?

The calibration uses a modern Earth radius of "approximately 6,437 km" (Figure 3). NASA gives Earth's mean radius as about 6,371 km and its equatorial radius as about 6,378.137 km. The paper's figure matches neither, and is about 1% larger than the mean radius.

Working backwards from some of the paper's yojana values shows that different parts of the paper use different Earth sizes.

![The Aryabhata rows of Table 1, with the 12,734 km diameter and the 12.26 and 12.29 km yojanas highlighted](/images/blog/sayana-audit/fig04_table1_aryabhata_rows.webp)

*Figure 11: (Iyer, Gour & Maurya 2026, p. 5, Table 1)*

![The paper's prose giving 12.14 km and 12.17 km per yojana, highlighted](/images/blog/sayana-audit/fig05_prose_1214_1217.webp)

*Figure 12: The same two scholars, with different values in the prose. (Iyer, Gour & Maurya 2026, p. 3)*

**Table 2: The Earth radius implied by some of the paper's yojana values.**

| Where in the paper | Values | Implied Earth radius |
|---|---|---|
| Table 1, Nilakantha and Yallaya | 12.26 and 12.29 km | about 6,439 km |
| Prose on p. 3, Nilakantha and Yallaya | 12.14 and 12.17 km | about 6,376 km |
| Table 1, Varahamihira | 12.523 km | about 6,378 km |
| Table 1, Aryabhata | diameter stated as 12,734 km | 6,367 km |

A difference of around 1% doesn't overturn any interpretation. But one modern reference, applied everywhere, would make the work easier to check.

### Two mistakes in the paper's Table 2

The paper's Table 2 converts each text's nimesa into seconds twice: once using an ordinary day of 86,400 seconds, and once using a **sidereal day** of 86,164.0905 seconds. A sidereal day is the time Earth takes to spin once compared with the distant stars. It is about 4 minutes shorter than an ordinary day.

![Table 2 of the paper, with the sidereal day value and the Manusmriti and Bhagavata Purana sidereal entries highlighted](/images/blog/sayana-audit/fig06_table2_sidereal.webp)

*Figure 13: The sidereal-day column. (Iyer, Gour & Maurya 2026, p. 7, Table 2)*

To get seconds per nimesa, you divide the length of the day by the number of nimesas in a day. Two entries don't come out right:

**Table 3: Two sidereal-day entries in the paper's Table 2, rechecked.**

| Text | Nimesas per day | Calculation | Correct value | Printed |
|---|---|---|---|---|
| Manusmriti | 486,000 | 86,164.0905 ÷ 486,000 | 0.17729 s | 0.17740 s |
| Bhagavata Purana | 202,500 | 86,164.0905 ÷ 202,500 | 0.42550 s | 0.42584 s |

Rounding doesn't explain these. But the 16 main speed calculations don't use these two entries, so none of those results change. A check of all seven entries is in the appendix.

### The 0.088-second nimesa

For two rows in Table 5, the authors choose a nimesa of 0.088 s.

![The paper's text giving a nimesa of about 0.0886 s, highlighted](/images/blog/sayana-audit/fig09_nimesa_00886.webp)

*Figure 14: The text gives about 0.0886 s. (Iyer, Gour & Maurya 2026, p. 6)*

![The paper's decision to employ 0.088 s as a standard nimesa, highlighted](/images/blog/sayana-audit/fig10_nimesa_0088_standard.webp)

*Figure 15: The calculations use 0.088 s. (Iyer, Gour & Maurya 2026, p. 6)*

The nearby text says about 0.0886 s, and the paper's Table 2 gives 0.08865 s and 0.08889 s. Rounded to three decimal places, all of these become 0.089, not 0.088. The Table 5 divisions are correct for 0.088, and nothing here disproves the historical time unit. The choice just needs a justification that connects it to the paper's own values.

### A few small slips

- The paper says one pair of values comes "within a 33% margin" of the speed of light, but its own Table 5 gives that pair as about +34.7%. The same sentence credits these values to Brahmagupta, while Tables 1 and 5 credit the 8.07 km yojana to Bhaskara II.
- On page 7, the yojanas used are said to range up to 15.54 km. The largest value in Table 1 is 15.23 km.
- The verse is cited as Rigveda 1.50.4 on page 2 and as 1.50.5 on page 9.
- On page 4, "800 angulas" appears where the paper's own working uses 8,000 dhanus of 108 angulas each.

None of these change the main argument. So, setting the inputs aside, how strong is the paper's overall argument?

## How Strong Is the Argument?

**Many conversions are not many measurements.** The 16 speeds are 16 different readings of one sentence, not 16 independent measurements of light. When several land in the same broad range, that tells us about the units chosen, not about separate confirmations. I also haven't tried to put a probability on coincidence, because that would need a proper statistical model.

**A precise number is not necessarily a measured number.** The paper argues that 2,202 is oddly specific, as if someone was aiming for precision.

![The paper's argument that the specific figure of 2202 suggests an effort at precision rather than exaggeration, highlighted](/images/blog/sayana-audit/v2_precision_2202.webp)

*Figure 16: (Iyer, Gour & Maurya 2026, pp. 10 and 11)*

But precision (how many digits a number has) is not the same as accuracy (how close it is to the truth). The paper itself offers 2,200 as an example of a rounded figure. Changing 2,202 to 2,200 changes the result by only about 0.09%, far less than the spread between the paper's different unit choices. The extra digits don't tell us how the number was obtained.

**A possible reading, then firmer words.** On page 9, the paper suggests that the Sun's "speed" may be a poetic way of describing the speed of sunlight.

![The paper's suggestion that the Sun's speed may reasonably be taken as a figurative reference to the swiftness of sunlight, highlighted](/images/blog/sayana-audit/v2_sunlight_reading.webp)

*Figure 17: A possible reading, offered on page 9. (Iyer, Gour & Maurya 2026, p. 9)*

By page 11, the wording is firmer, describing Sayana as postulating a value for the speed of light.

![The paper's conclusion describing Sayana as postulating a numerical value for the speed of light, highlighted](/images/blog/sayana-audit/fig12_postulates.webp)

*Figure 18: Firmer wording on page 11. (Iyer, Gour & Maurya 2026, p. 11)*

To be fair, the very next page returns to the cautious position: the paper does not claim a definitive or experimentally established ancient measurement (Figure 2). My only suggestion is that page 11 should carry the same caution as pages 9 and 12, so readers don't take a possible reading as a settled one.

## So, Where Does This Leave Us?

When I was 14, the idea that our ancient texts mentioned the speed of light felt exciting. Studying the claim properly turned out to be more interesting than either believing it or dismissing it.

Here's what holds up. The paper's arithmetic is right. It correctly separates Sayana's commentary from the Rigveda. Some of its chosen conversions really do produce numbers near the modern speed of light. And its authors are careful not to claim more than that.

Here's what needs work: how the units are chosen. Picking between two Arthashastra values moves one result from about 7% to about 25% away from c. The closest result rests on a bracketed conversion in an English translation. One Earth-size figure doesn't match its cited source. And smaller yojanas are set aside because of their size, not historical evidence.

What I understand now, and didn't at 14, is that a number landing near the speed of light is only the start of the question. Correct arithmetic doesn't validate the historical inputs. A resemblance doesn't, on its own, show that anyone knew a physical constant. And not having proof of an ancient measurement isn't proof that none happened. It means the evidence we have doesn't settle it.

The paper itself says as much. That honesty is worth remembering whenever this claim comes up.

If you spot a mistake in my working, I genuinely want to hear about it. You can [write to me here](https://astrokshitij.com/contact).

## Check It Yourself

Everything below works on an ordinary calculator.

**Speed from any row:** `4404 × Y ÷ N`. Use the full nimesa, because the 4,404 already includes the "half".

**Percentage difference:** `100 × (speed ÷ 299792.458 − 1)`. A positive answer means above the modern speed of light. A negative answer means below.

**The closest row:** `4404 × 12.87 ÷ 0.1778 = 318,782.227` km/s, and `100 × (318782.227 ÷ 299792.458 − 1) ≈ +6.334%`.

**The two Arthashastra yojanas:** `4404 × 15.23 ÷ 0.24 = 279,470.5` km/s (about −6.78%), and `4404 × 12.3 ÷ 0.24 = 225,705` km/s (about −24.71%).

**The two Table 2 entries:** `86164.0905 ÷ 486000 ≈ 0.177292` s (printed 0.17740), and `86164.0905 ÷ 202500 ≈ 0.425502` s (printed 0.42584).

**The Surya Siddhanta circumference:** `1600 × √10 ≈ 5059.64` yojanas (the paper uses 4,800).

## Appendix: All 16 Tabulated Speeds

These use the paper's printed inputs exactly. All 16 speeds match the paper to the displayed rounding. The percentages also match, except that the paper prints −15.44% for the second row, where standard rounding gives −15.45%.

**Table 4: The paper's 16 printed speeds, recomputed with 4,404 × Y ÷ N.**

| Yojana source | Nimesa source | Speed (km/s) | Difference from c |
|---|---|---|---|
| Nilakantha (12.26 km) | Vishnu Purana (0.2133 s) | 253,131.927 | −15.564% |
| Nilakantha (12.26 km) | Mahabharata (0.2130 s) | 253,488.451 | −15.445% |
| Aryabhata (12.13 km) | Vishnu Purana (0.2133 s) | 250,447.820 | −16.460% |
| Aryabhata (12.13 km) | Mahabharata (0.2130 s) | 250,800.563 | −16.342% |
| Yallaya (12.29 km) | Vishnu Purana (0.2133 s) | 253,751.336 | −15.358% |
| Yallaya (12.29 km) | Mahabharata (0.2130 s) | 254,108.732 | −15.238% |
| Matsya Purana (12.30 km) | Vishnu Purana (0.2133 s) | 253,957.806 | −15.289% |
| Matsya Purana (12.30 km) | Mahabharata (0.2130 s) | 254,315.493 | −15.169% |
| Brahmanda Purana (13.54 km) | Vishnu Purana (0.2133 s) | 279,560.056 | −6.749% |
| Brahmanda Purana (13.54 km) | Mahabharata (0.2130 s) | 279,953.803 | −6.617% |
| Varahamihira (12.523 km) | Vishnu Purana (0.2133 s) | 258,562.082 | −13.753% |
| Varahamihira (12.523 km) | Mahabharata (0.2130 s) | 258,926.254 | −13.631% |
| Arthashastra (15.23 km) | Arthashastra (0.24 s) | 279,470.500 | −6.779% |
| Manusmriti (12.87 km) | Manusmriti (0.1778 s) | 318,782.227 | +6.334% |
| Bhaskara II (8.07 km) | 0.088 s | 403,866.818 | +34.715% |
| Surya Siddhanta (8.35 km) | 0.088 s | 417,879.545 | +39.390% |

## Appendix: All Seven Entries in the Paper's Table 2

Each row multiplies out the paper's own unit hierarchy to get nimesas per day, then divides the ordinary day (86,400 s) and the sidereal day (86,164.0905 s) by that number.

**Table 5: All seven entries in the paper's Table 2, rechecked.**

| Text | Hierarchy multiplied out | Nimesas per day | Ordinary day: correct / printed | Sidereal day: correct / printed | Verdict |
|---|---|---|---|---|---|
| Siddhanta Shiromani | 18 × 30 × 30 × 2 × 30 | 972,000 | 0.08889 / 0.08889 | 0.08865 / 0.08865 | Matches |
| Manusmriti | 18 × 30 × 30 × 30 | 486,000 | 0.17778 / 0.17778 | 0.17729 / 0.17740 | Sidereal entry wrong |
| Vishnu Purana | 15 × 30 × 30 × 30 | 405,000 | 0.21333 / 0.21333 | 0.21275 / 0.21275 | Matches |
| Mahabharata | 15 × 30 × 30.1 × 30 | 406,350 | 0.21262 / 0.213 | 0.21204 / 0.2127 | Printed values follow the approximate "~405,000" shown, not the stated hierarchy |
| Arthashastra | 5 × 30 × 40 × 2 × 30 | 360,000 | 0.24 / 0.24 | 0.23934 / 0.239 | Matches |
| Bhagavata Purana | 3 × 5 × 15 × 15 × 2 × 30 | 202,500 | 0.42667 / 0.42667 | 0.42550 / 0.42584 | Sidereal entry wrong |
| Sridhara's commentary | 15 × 30 × 30 × 2 × 30 | 810,000 | 0.10667 / 0.1067 | 0.10638 / 0.1064 | Matches |

The Mahabharata row is an approximation rather than a clear mistake. Its hierarchy includes 30 and one-tenth kalas per muhurta, which gives 406,350, and the paper marks its 405,000 with "~". The difference is about 0.3%. The Mahabharata nimesa used in the paper's Table 3, 0.2130 s, carries this approximation.

## Sources

- Iyer, K., Gour, M. and Maurya, G. (2026). Pre-Rømer reflections on the speed of light in Indian texts: a scientific and philological reassessment of Sāyaṇa's Ṛgveda commentary. *Proceedings of the Indian National Science Academy*. [doi.org/10.1007/s43538-026-00814-x](https://doi.org/10.1007/s43538-026-00814-x). All highlighted figures are from this paper; highlights added.
- Burgess, E. (trans.) (1935). *Translation of the Sūrya Siddhānta*. University of Calcutta. Verse I.59, printed p. 43. [PDF](https://classicalastrologer.com/wp-content/uploads/2018/04/surya_siddhanta_english.pdf)
- Venugopal, P., Rupa, K., Uma, S. K. and Rao, S. B. (2019). The concepts of deśāntara and yojana in Indian astronomy. *Journal of Astronomical History and Heritage*, 22(3), 401 to 406, printed p. 403. [PDF](https://adsabs.harvard.edu/pdf/2019JAHH...22..401V)
- Jha, G. (trans.). *Manusmṛti with the commentary of Medhātithi*, verse 8.406. [English rendering](https://www.wisdomlib.org/hinduism/book/manusmriti-with-the-commentary-of-medhatithi/d/doc201341.html) and [Sanskrit commentary](https://www.wisdomlib.org/hinduism/book/manusmriti-with-manubhashya-sanskrit/d/doc1648181.html).
- NASA. [Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html).
