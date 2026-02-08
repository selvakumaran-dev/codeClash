import { motion } from 'framer-motion';
import {
    Terminal,
    Zap,
    Shield,
    ArrowRight,
    Code2,
    Trophy
} from 'lucide-react';

const LandingPage = ({ onEnterArena }) => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">

            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center px-6 pt-20 pb-32 text-center relative overflow-hidden">

                {/* Premium Aurora Background */}
                <div className="absolute inset-0 bg-aurora opacity-50 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-0 grid-pattern pointer-events-none" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    {/* Detailed Glass Badge */}
                    <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-text-primary/10 bg-text-primary/5 backdrop-blur-md shadow-xl text-xs font-mono text-text-secondary hover:border-accent-neon/30 hover:bg-text-primary/10 transition-all cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-neon opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-neon"></span>
                            </span>
                            <span className="tracking-wide font-medium text-text-primary/80">v2.0 &mdash; SPECTATOR MODE LIVE</span>
                        </div>
                    </motion.div>

                    {/* Premium Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-8xl font-bold tracking-tight text-text-primary mb-8 leading-[1.05]"
                    >
                        Code Battles. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-neon via-text-primary to-accent-neon bg-[length:200%_auto] animate-[text-shine_4s_linear_infinite]">
                            Made Fun.
                        </span>
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        The best way to practice coding with friends.
                        Solve problems together and use fun power-ups to confuse your opponent.
                    </motion.p>

                    {/* CTA Group - Premium Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={onEnterArena}
                            className="btn-neon text-lg px-8 py-4 flex items-center justify-center gap-3 group w-full sm:w-auto"
                        >
                            <Terminal className="w-5 h-5" />
                            <span>Start Coding</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button className="w-full sm:w-auto px-8 py-4 rounded-lg border border-text-primary/10 bg-text-primary/5 backdrop-blur-sm text-text-primary hover:bg-text-primary/10 hover:border-text-primary/20 transition-all flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl">
                            <Code2 className="w-5 h-5 text-text-secondary" />
                            <span>How it Works</span>
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Grid (The "Linear" Layout) */}
            <section className="py-24 px-6 border-t border-border-subtle bg-bg-panel/30">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">A Powerful Code Editor</h2>
                        <p className="text-text-secondary max-w-xl">
                            Everything you need to write great code, plus a few tricks to help you win.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Instant Updates',
                                desc: 'See exactly what is happening in real-time, with no delay.',
                                icon: Zap,
                                color: 'text-accent-neon'
                            },
                            {
                                title: 'Fun Power-ups',
                                desc: 'Use effects like "Fog" or "Shake" to interact with your opponent.',
                                icon: Shield,
                                color: 'text-accent-chaos'
                            },
                            {
                                title: 'Leaderboards',
                                desc: 'Track your progress and see how you compare to others.',
                                icon: Trophy,
                                color: 'text-blue-400'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="panel-professional p-8 hover:translate-y-[-4px] transition-transform duration-300 group"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-bg-void border border-border-subtle flex items-center justify-center mb-6 group-hover:border-text-primary/20 transition-colors`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div >
    );
};

export default LandingPage;
