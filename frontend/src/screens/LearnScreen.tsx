import { useState } from 'react'
import Header from '../components/Header'
import Icon from '../components/Icon'
import { appLessons, lanternflyStages } from '../types'

export default function Learn({ passedLessons, passLesson }: { passedLessons: number[]; passLesson: (lesson: number) => void }) {
    const [lesson, setLesson] = useState<number | null>(null)
    const [q, setQ] = useState(0)
    const [answers, setAnswers] = useState<number[]>([])

    const active = lesson === null ? null : appLessons[lesson]
    const score = active ? answers.filter((a, i) => a === active.questions[i]?.correctAnswerIndex).length : 0

    const answer = (a: number) => {
        if (!active || lesson === null) return
        const next = [...answers, a]
        setAnswers(next)
        if (q < active.questions.length - 1) setQ(q + 1)
        else if (next.every((v, i) => v === active.questions[i].correctAnswerIndex)) passLesson(lesson)
    }

    const closeLesson = () => { setLesson(null); setQ(0); setAnswers([]) }

    if (active && lesson !== null) return (
        <main className="screen learn-screen">
            <Header title={active.title} onBack={closeLesson} eyebrow={`${active.eyebrow} · +10 PTS`} />
            <section className="lesson-intro">
                <div className="badge-small"><Icon name={lesson === 1 ? 'leaf' : lesson === 2 ? 'users' : 'book'} /></div>
                <div><small>QUICK LESSON</small><p>{active.summary}</p></div>
            </section>
            {answers.length < active.questions.length ? (
                <>
                    <div className="quiz-progress"><i style={{width: `${(q + 1) * 50}%`}}/></div>
                    <p className="question-count">CHECK YOUR KNOWLEDGE · {q + 1} OF 2</p>
                    <h2 className="quiz-question">{active.questions[q].question}</h2>
                    <div className="answer-list">
                        {active.questions[q].options.map((a, i) => (
                            <button key={a} onClick={() => answer(i)}><span>{String.fromCharCode(65+i)}</span>{a}</button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="quiz-finish">
                    <div className="badge-large"><Icon name={score === 2 ? 'check' : 'book'} size={42}/></div>
                    <p className={`status ${score === 2 ? 'confirmed-text' : 'uncertain-text'}`}>{score === 2 ? 'LESSON PASSED' : 'TRY AGAIN'}</p>
                    <h2>{score}/2 correct</h2>
                    <p>{score === 2 ? `${passedLessons.includes(lesson) ? 'Completed' : '+10 points earned'} · ${passedLessons.length}/3 lessons passed` : 'Review the lesson and try the two questions again.'}</p>
                    <button className="primary" onClick={score === 2 ? closeLesson : () => {setQ(0);setAnswers([])}}>{score === 2 ? 'Back to lessons' : 'Try again'}</button>
                </div>
            )}
        </main>
    )

    return (
        <main className="screen learn-screen">
            <Header title="Field guide" eyebrow="LEARN · IDENTIFY · PROTECT" />
            <section className="hero-learn">
                <div><small>QUICK ID</small><h2>Know what<br/>to look for.</h2><p>Each life stage looks different.</p></div>
                <div className="hero-bug"><i/><i/><b/></div>
            </section>
            <div className="section-title"><div><small>IDENTIFICATION</small><h2>Life stages</h2></div><span>Swipe to explore</span></div>
            <div className="stage-scroll">
                {lanternflyStages.map((stage, i) => (
                    <article className="stage-card" key={stage.name}>
                        <div className="stage-art">
                            <div className="stage-symbol">{i === 0 ? '≋' : i === 1 ? '••' : i === 2 ? '✣' : '◆'}</div>
                            <span>{stage.activeMonths}</span>
                        </div>
                        <h3>{stage.name}</h3>
                        <p>{stage.description}</p>
                    </article>
                ))}
            </div>
            <div className="section-title"><div><small>WHERE TO LOOK</small><h2>Host trees</h2></div></div>
            <div className="host-list">
                {[['Tree of Heaven','Crushed leaves smell like burnt peanut butter. Smooth leaf edges.'],['Black walnut','Dark, deeply furrowed bark and long compound leaves.'],['Maple','Opposite branches with familiar pointed, lobed leaves.']].map(([n,d]) => (
                    <article key={n}><span className="leaf-shape">♣</span><div><h3>{n}</h3><p>{d}</p></div><Icon name="chevron"/></article>
                ))}
            </div>
            <section id="lookalikes" className="lookalikes">
                <small>COMPARE</small><h2>Lanternfly or look-alike?</h2>
                <div className="compare">
                    <div><span className="compare-bug">◆</span><b>Lanternfly</b><p>Spotted gray wings, red beneath</p></div>
                    <div><span className="compare-bug">◉</span><b>Native moth</b><p>Soft scaled wings, no red flash</p></div>
                </div>
                <p className="protect-note">When in doubt, report first and leave it alone.</p>
            </section>
            <section className="why-card">
                <span>01</span>
                <div><small>WHY IT MATTERS</small><h3>Sugary waste feeds sooty mold</h3><p>It blocks sunlight and weakens trees, vines, and crops across Virginia.</p></div>
            </section>
            <div className="section-title"><div><small>BUILD YOUR SKILLS</small><h2>Lessons & quizzes</h2></div><span>{passedLessons.length}/3 passed</span></div>
            <div className="lesson-list">
                {appLessons.map((item, index) => (
                    <button key={item.title} onClick={() => {setLesson(index);setQ(0);setAnswers([])}} className={passedLessons.includes(index) ? 'passed' : ''}>
                        <span className="lesson-number">{passedLessons.includes(index) ? <Icon name="check" size={18}/> : index + 1}</span>
                        <div><small>{item.eyebrow} · 2 QUESTIONS</small><b>{item.title}</b><p>{item.summary}</p></div>
                        <Icon name="chevron"/>
                    </button>
                ))}
            </div>
            <section className={`field-expert-progress ${passedLessons.length === 3 ? 'complete' : ''}`}>
                <div className="badge-small"><Icon name="trophy"/></div>
                <div><small>FIELD EXPERT BADGE</small><b>{passedLessons.length === 3 ? 'Badge earned' : `Pass all lessons · ${passedLessons.length}/3`}</b></div>
            </section>
        </main>
    )
}