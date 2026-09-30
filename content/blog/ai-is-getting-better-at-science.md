---
title: AI Is Getting Better at Science. But Can It Discover?
excerpt: A chatbot that failed my general relativity homework in 2022 is now in the news for a claimed proof of a Millennium Prize Problem. Can AI make a foundational discovery the way Newton and Einstein did, or will it only make our work faster? Four obstacles, and a possible way around each.
category: Investigation
readTime: 9 min
date: 2026-09-30
draft: false
quote: "“Science has always depended on our ability to understand how we know what we know. AI may be about to challenge that.”"
cover: /images/blog/ai-science-cover.webp
ogImage: /images/blog/ai-science-cover.jpg
coverAlt: Einstein in black and white looking toward a glowing neural network that turns the field equations into a colourful warped spacetime around a black hole
---

I still remember it was late December 2022. A friend of mine, who was working at Hugging Face at the time, got very excited in our group chat about a tool called ChatGPT. He asked us all to try it, so I did.

It was beyond what I expected (the same model would frustrate me today). Back then, I was in the second year of my masters, working on my research thesis. A few corrections later, the code it generated worked. Thrilled, I thought this would change the way research gets done.

Then, feeling ambitious, I asked it to solve a complex general relativity calculation. It failed badly.

It didn't put me off, though. The takeaway was simple: okay, at least it can speed up my work.

Now fast forward to September 2026. OpenAI says an internal model has produced a proof for the Navier-Stokes problem, one of the seven Millennium Prize Problems. It is still a claim. Experts haven't verified it yet, and the Clay Mathematics Institute waits at least two years before it even considers a proposed solution. Still, the same tool that couldn't handle my relativity homework is now in the news for one of the hardest problems in mathematics.

There is no final answer yet. But one question keeps coming back: can AI make a foundational discovery the way Newton and Einstein did? Or will it only make our work faster? And are we even doing science if we can't see inside the black box?

## Where AI Stands Today

In my corporate role, AI is part of everything: user journeys, data and metric analysis, agentic workflows. Work that once needed a team of at least five people, I now finish alone in a day.

Today everyone knows that AI can make mistakes. So when I vibe code (building something without writing the code myself), I always run AI evals. These are checks that make sure my output isn't affected by bias or hallucination.

For example, I built a RAG bot (a chatbot that answers from our own documents) to help our customer support team understand the product better. It can't be trusted without evals. They make sure every answer comes with enough accuracy and confidence. If an answer falls short, it doesn't go out.

This same error is why many people say AI is too unreliable for scientific research. But unreliable today doesn't mean unreliable forever, because there are already ways to catch wrong answers.

**Table 1: Four ways to catch wrong AI answers in science, and how much of the AI's reasoning each one lets you see.**

| Method | What it does | How much you can see |
| --- | --- | --- |
| Physics-Informed Neural Networks (PINNs) | Forces the AI to obey known physical laws | Medium: the answers follow physics, but the inner workings stay hidden |
| Symbolic Regression | Turns what the AI learned into a short equation | High: you get a formula you can read |
| Lean 4 (proof checker) | Checks every step of a math proof | Very high: every step is verified |
| FrontierMath, HLE | Tests AI on hard, unpublished problems | High: hard to cheat |

The pattern is simple: each method works best where an answer can be checked. Keep that in mind, because it comes back later.

## The Five Epochs of Scientific Inquiry

To see how far AI can go, we first need to see how science itself got here. Human inquiry has gone through five phases. In each one, the tools changed what humans had to do themselves.

**Epoch I, Observational:** We recorded what we saw, like Babylonian sky tables and Tycho Brahe's planetary logs. We noticed patterns but couldn't explain them.

**Epoch II, Theoretical:** In the 17th century, Galileo, Kepler and Newton compressed decades of data into a few clean laws. Kepler's three laws became Newton's single inverse-square law. Powerful, but sometimes too rigid.

**Epoch III, Computational:** Some problems, like turbulence, had no neat solutions. So we let computers crunch numbers for equations we had already written. The machine calculated, but we still supplied the ideas.

**Epoch IV, Data-Intensive:** Sky surveys, sensors and high-throughput labs gave us huge datasets. We mined them for patterns, with a risk of fake correlations.

**Epoch V, Agentic:** AI now learns patterns directly from raw observations. It reads papers, writes code, runs experiments and even controls robots.

Notice the shift. First our tools helped us see, then calculate. In Epoch V, they help us infer, which used to be our job alone. That comes with a side effect, and it is the first obstacle.

![Chalkboard graphic titled Five Epochs of Inquiry, showing a staircase from a telescope (Epoch I) to a computer chip (Epoch III) to a neural network feeding a black box (Epoch V)](/images/blog/ai-science-epochs.webp)

## Why Handing Science Over Is Hard

Today, a human still has to stay in the loop. But is that permanent, or just where the technology is right now? There are four obstacles. For each one, here is why it's a problem and a possible way around it.

### Obstacle 1: The Black Box

**Why it's a problem:** I trust my calculator because I know how it works. Doing the same sum by hand takes longer, but the mechanism can always be checked.

![Chalkboard graphic titled Piercing the Black Box, showing a neural network passing through a prism of physics constraints and coming out as the gravity law F proportional to m1 m2 over r squared](/images/blog/ai-science-black-box.webp)

With modern AI, that isn't true. Vibe coding works this way for me. I understand the product and write the PRD, but have little idea about the logic underneath. That's fine in product building. In science, it hits the core of the job. How do you know your description of reality is accurate when you don't know how you found it?

Philosopher Paul Humphreys called this epistemic opacity: a human can't follow every step of how a result was reached. And it will likely get worse. As models grow bigger, the box gets more complicated, and so does the effort to understand it.

**A possible way around it:** Make the box readable. Researchers are already working on this. For example, Miles Cranmer's team used symbolic regression to pull readable force laws out of a trained neural network. If methods like this scale up, the box may grow without growing more mysterious.

![Chalkboard graphic titled Distilling Analytical Truth, showing a neural network funnelled into a readable formula for gravitational force](/images/blog/ai-science-distilling.webp)

### Obstacle 2: Checking Truth in the Real World

**Why it's a problem:** In math, wrong answers are easy to catch. A proof checker like Lean rejects any step that doesn't hold up. But a checker only checks the question it was given. It can't tell if the problem was stated correctly in the first place.

Outside math, it gets harder. Take the A-Lab. In late 2023, a Berkeley Lab robot lab claimed to have made 41 new compounds. Outside chemists argued that the AI had misread its X-ray data and mistaken known materials for new ones. The A-Lab team disputed parts of that. Either way, a convincing discovery and a real one can look the same until someone checks.

**A possible way around it:** Build a checker for every field. Physics rules can be built into the AI, and robots can test its predictions in real labs. The more of science we can turn into something checkable, the less we have to take the AI's word for it.

![Chalkboard graphic titled The Crisis of Epistemic Opacity, showing predictive mastery rising while theoretical transparency falls, with a black box between them](/images/blog/ai-science-opacity.webp)

### Obstacle 3: Breaking the Paradigm

**Why it's a problem:** Thomas Kuhn argued that most science is "normal science," solving puzzles inside an accepted framework. Real revolutions, like Newton to Einstein, happen only when old ideas stop working and a whole new way of seeing takes over.

Right now, AI works mostly inside normal science. AlphaFold 3 didn't invent new laws of physics. It solved a huge puzzle that known biology and physics had already set up. AI learns from human-made data, so it's good at patterns inside that data. Einstein's equations predicted gravitational waves a century before we detected them, using math alone. A model trained only on pre-1915 physics might struggle to make that leap, though that is a thought experiment, not a tested result. Philosopher Paul Feyerabend added that breakthroughs often need rule-breaking, and an AI trained on consensus may treat a radical idea as noise.

![Chalkboard graphic titled The Paradigm Shift Dilemma, showing a circle of normal science (interpolation) with an arrow pointing out to a paradigm shift (extrapolation)](/images/blog/ai-science-paradigm.webp)

**A possible way around it:** Here's where I push back a little. Einstein did think out of the box, but that creativity still lived inside his own world of knowledge. He could never have worked out the laws of gravity for a universe he could never see. Humans are bound by experience too. However creative we get, we're joining dots inside our domain, just in a more complex way.

If that's right, AI could do the same. There are early hints. FunSearch found new constructions in a math problem, and AlphaProof solved Olympiad-level problems. It may also need a change at the very foundation, since today's models pick the most probable next word. This is a hypothesis, not a proven fact. It's a long shot, but worth the thought.

### Obstacle 4: Trust in the System

**Why it's a problem:** AI has made text almost free to produce, and science now faces a trust problem. Sleuths have found thousands of papers spun by paraphrasing software, with "tortured phrases" like "counterfeit consciousness" instead of "artificial intelligence." Now imagine AI-written papers reviewed by AI. That's a loop with no link to reality.

Philosophers Lisa Messeri and M. J. Crockett warn about an illusion of understanding: AI makes us feel we understand more than we do. It can happen when AI summarizes the literature, stands in for real data, crunches numbers we can't follow, or reviews papers.

**A possible way around it:** This one may be the most fixable, since it's about process, not intelligence. Independent replication, open data and formal verification can keep results tied to reality, if science builds these habits as fast as AI produces papers.

## So, Where Does This Leave Us?

Let me go back to that night in December 2022. I watched a chatbot fail at general relativity and figured it could, at best, speed up my work. Nearly four years later, it is claiming a proof for a problem that has stayed open for about 90 years.

Each obstacle is real today, and each has a plausible way around it. None of them is proven yet. So it's too early to say AI will never do what Newton and Einstein did, and too early to say it will. It comes down to three questions. Can we read what's inside the box? Can we verify truth outside of math? Can AI ever question the frame instead of just working inside it?

For now, humans stay in charge of meaning and direction. Whether that lasts depends on those answers, and nobody knows yet.

Science started as an attempt to find patterns in the noise of the world. The tools have changed, but the goal hasn't: figure out what's true, why it's true, and where our curiosity should go next.

And honestly, I can't wait to see what that first failed prompt turns into.
