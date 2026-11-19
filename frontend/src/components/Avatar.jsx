export default function Avatar({ user, size = 40, className = '' }) {
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const box = { width: size, height: size }

  if (user?.avatar_path) {
    return <img src={user.avatar_path} alt="" style={box} className={`shrink-0 rounded-full object-cover ${className}`} />
  }

  return (
    <div style={{ ...box, fontSize: size * 0.38 }} className={`grid shrink-0 place-items-center rounded-full bg-[#e0b46a] font-semibold text-[#2c2118] ${className}`} aria-hidden="true">
      {initials}
    </div>
  )
}