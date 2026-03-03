import brandPillImage from '../assets/brand-pill.png';

// Small reusable brand pill shown at top of every screen
interface BrandPillProps {
    className?: string;
}

const BrandPill = ({ className = "h-8 mb-4 w-auto" }: BrandPillProps) => {
    return (
        <img src={brandPillImage} alt="Intervue Poll" className={className} />
    );
};

export default BrandPill;
