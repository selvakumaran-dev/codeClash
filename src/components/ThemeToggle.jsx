import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    // Initialize state from local storage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }

        // Save preference
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-text-primary/5 border border-text-primary/10 hover:bg-text-primary/10 hover:border-text-primary/20 transition-all duration-300 group"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <motion.div
                    initial={false}
                    animate={{
                        y: theme === 'dark' ? 0 : 24,
                        opacity: theme === 'dark' ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="w-4 h-4 text-accent-neon" />
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{
                        y: theme === 'dark' ? -24 : 0,
                        opacity: theme === 'dark' ? 0 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-4 h-4 text-orange-400" />
                </motion.div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-current blur-md -z-10 text-white/5" />
        </button>
    );
};

export default ThemeToggle;
