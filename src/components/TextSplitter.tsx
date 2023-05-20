interface SplitterProps {
  text: string;
  className?: string;
  align?: 'left' | 'right' | 'center'
}

export default function TextSplitter({ text, className, align }: SplitterProps) {
  return (<div className={`flex gap-4 items-center ${align == 'right' ? 'flex-row-reverse' : ""} ${className}`}>
    {align == 'center' && <span className="flex-1 border h-0 border-black"></span>}
    <span className="">{text}</span>
    <span className="flex-1 border h-0 border-black"></span>
  </div>)
}