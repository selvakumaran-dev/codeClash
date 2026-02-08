import { motion } from 'framer-motion';

const Logo = ({ className = "text-3xl", animated = false }) => {
    return (
        <div className={`font-mono font-bold tracking-tighter select-none flex items-center gap-1 ${className}`}>
            <span className="text-accent-neon">&lt;</span>
            <span className="text-text-primary">Code</span>
            <span className="text-accent-neon">Clash</span>
            <span className="text-accent-neon">/&gt;</span>
        </div>
    );
};

export default Logo;
