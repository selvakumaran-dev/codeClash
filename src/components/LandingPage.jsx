import { motion } from 'framer-motion';
import {
    Terminal,
    ArrowRight,
    Sparkles,
    Code2,
    Zap,
    Globe
} from 'lucide-react';
import Logo from './Logo';

const LandingPage = ({ onEnterArena }) => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section - Professional & Clean */}
            <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 md:py-32 text-center relative overflow-hidden">

                {/* Subtle Premium Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-accent-neon/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.15, 0.25, 0.15],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-accent-chaos/20 rounded-full blur-[100px]"
                    />
                    <div className="absolute inset-0 grid-pattern opacity-20" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 max-w-5xl mx-auto"
                >
                    {/* Logo */}
                    <motion.div variants={itemVariants} className="mb-12 flex justify-center scale-125">
                        <Logo />
                    </motion.div>

                    {/* Status Badge - Professional */}
                    <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-text-primary/10 bg-bg-panel/60 backdrop-blur-xl shadow-lg text-xs font-medium text-text-secondary hover:border-accent-neon/20 transition-all cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-neon opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-neon"></span>
                            </span>
                            <span className="text-text-primary font-semibold">Live Platform</span>
                        </div>
                    </motion.div>

                    {/* Professional Headline - Short & Clean */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
                    >
                        <span className="text-text-primary">Code. </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-neon to-accent-neon/80">Compete. </span>
                        <span className="text-text-primary">Win.</span>
                    </motion.h1>

                    {/* Clean Subheadline */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-text-secondary/90 max-w-2xl mx-auto mb-12 leading-relaxed font-normal"
                    >
                        Real-time coding battles with developers worldwide
                    </motion.p>

                    {/* Primary CTA */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 mb-16">
                        <button
                            onClick={onEnterArena}
                            className="group relative px-10 py-4 bg-accent-neon text-bg-void text-base font-bold rounded-xl shadow-neon hover:shadow-[0_0_30px_rgba(0,221,165,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Terminal className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Enter Arena</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                        </button>

                        {/* Platform Features - Clean & Professional */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-accent-neon" />
                                <span className="font-medium">8 Languages</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-text-secondary/30"></div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent-chaos" />
                                <span className="font-medium">Real-time Sync</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-text-secondary/30"></div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-400" />
                                <span className="font-medium">Spectator Mode</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Professional Feature Highlights */}
                    <motion.div
                        variants={itemVariants}
                        className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto"
                    >
                        {[
                            {
                                icon: Terminal,
                                title: "Monaco Editor",
                                desc: "Professional code editor with syntax highlighting"
                            },
                            {
                                icon: Zap,
                                title: "Live Updates",
                                desc: "See your opponent's code in real-time"
                            },
                            {
                                icon: Sparkles,
                                title: "Power-ups",
                                desc: "Strategic abilities to gain competitive edge"
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl bg-bg-panel/40 backdrop-blur-sm border border-text-primary/5 hover:border-text-primary/10 transition-all"
                            >
                                <feature.icon className="w-5 h-5 text-accent-neon mb-3" />
                                <h3 className="text-sm font-bold text-text-primary mb-1">{feature.title}</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Clean Footer */}
            <section className="py-8 px-6 border-t border-border-subtle/30 bg-bg-panel/20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-text-secondary">
                                Built for developers who love to compete
                            </p>
                        </div>
                        <button
                            onClick={onEnterArena}
                            className="px-6 py-2.5 bg-text-primary/5 hover:bg-text-primary/10 border border-text-primary/10 hover:border-accent-neon/30 rounded-lg text-text-primary text-sm font-semibold transition-all duration-300 flex items-center gap-2 group"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
