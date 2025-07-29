import { ArrowLeftCircle } from 'lucide-react';
import Link from 'next/link';

type BackButtonProps = {
  text: string;
  link: string;
};

const BackButton = ({ text, link }: BackButtonProps) => {
  return (
    <div>
      <Link
        href={link}
        className='flex items-center gap-1 text-gray-500 hover:underline'
      >
        <ArrowLeftCircle
          className='text-slate-500 dark:text-slate-200'
          size={24}
        /> {text}
      </Link>
    </div>
  );
};

export default BackButton;
