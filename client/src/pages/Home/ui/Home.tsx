import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app";
import styles from "../styles/home.module.css";

export const Home = () => {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className={styles.home}>
            <section className={styles.hero} aria-labelledby="home-title">
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>
                        <span className={styles.pencilMark} aria-hidden="true">✎</span>
                        A little drawing, a lot of fun
                    </span>
                    <h1 id="home-title">
                        Draw it.
                        <br />
                        <span>Guess it.</span>
                        <br />
                        <span className={styles.lastLine}>Laugh about it.</span>
                    </h1>
                    <p className={styles.intro}>
                        Grab a color, sketch a secret word, and see if your friends can figure it out
                        before the timer runs out.
                    </p>
                    <div className={styles.actions}>
                        <Link className={styles.primaryAction} to={user ? "/rooms" : "/register"}>
                            {user ? "Find a room" : "Let’s play"}
                            <span aria-hidden="true">→</span>
                        </Link>
                        {!user && (
                            <Link className={styles.secondaryAction} to="/login">
                                I already have an account
                            </Link>
                        )}
                    </div>
                    <p className={styles.note}>
                        <span aria-hidden="true">★</span> No artistic skills required
                    </p>
                </div>

                <div className={styles.artCard} aria-label="A playful drawing and guessing illustration">
                    <div className={styles.paper}>
                        <div className={styles.paperHeader}>
                            <span>today’s masterpiece</span>
                            <span className={styles.timer}>00:24</span>
                        </div>
                        <svg
                            className={styles.drawing}
                            viewBox="0 0 360 250"
                            role="img"
                            aria-label="A smiling stick figure"
                        >
                            <circle cx="180" cy="77" r="43" fill="#ffd875" stroke="#302a25" strokeWidth="7" />
                            <circle cx="165" cy="70" r="4" fill="#302a25" />
                            <circle cx="195" cy="70" r="4" fill="#302a25" />
                            <path d="M161 88c10 16 28 16 38 0"
                                fill="none"
                                stroke="#302a25"
                                strokeWidth="5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M180 120v58m0-43-48 34m48-34 48 34m-48 9-35 45m35-45 35 45"
                                fill="none"
                                stroke="#302a25"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className={styles.guess}>
                            <span>Drawn with a smile</span>
                            <span className={styles.guessBlanks}>: )</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.steps} aria-labelledby="steps-title">
                <div className={styles.stepGrid}>
                    <article className={styles.stepCard}>
                        <span className={`${styles.stepNumber} ${styles.yellow}`}>1</span>
                        <h3>Join a room</h3>
                        <p>Hop into a public room or make a private one for your friends.</p>
                    </article>
                    <article className={styles.stepCard}>
                        <span className={`${styles.stepNumber} ${styles.pink}`}>2</span>
                        <h3>Draw the word</h3>
                        <p>Take your turn with the brush and give everyone a clue.</p>
                    </article>
                    <article className={styles.stepCard}>
                        <span className={`${styles.stepNumber} ${styles.green}`}>3</span>
                        <h3>Guess & giggle</h3>
                        <p>Type your guess before time is up and collect points.</p>
                    </article>
                </div>
            </section>
        </div>
    );
};
