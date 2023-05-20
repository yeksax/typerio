interface InputProps {
  type: 'email' | 'text' | 'password';
  label: string,
  placeholder?: string,
}

export default function Input({ type, label, placeholder }: InputProps) {
  return (
    <div className="flex flex-col text-left">
      <label className="text-md font-semibold text-lg mb-1">{label}</label>
      <input type={type} placeholder={placeholder} className="px-4 text-sm py-2 border-2 border-black rounded-md" required />
    </div>
  )
}