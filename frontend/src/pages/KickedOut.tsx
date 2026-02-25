import BrandPill from '../components/BrandPill';

const KickedOut = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <BrandPill />
            <h1 className="text-4xl font-bold mt-6 mb-3">You've been Kicked out !</h1>
            <p className="text-[#6e6e6e] max-w-md">
                Looks like the teacher had removed you from the poll system. Please Try again sometime.
            </p>
        </div>
    );
};

export default KickedOut;
