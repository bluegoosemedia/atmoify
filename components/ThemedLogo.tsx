"use client"

export function ThemedLogo() {
  return (
    <div className="w-[36px] h-[36px]">
      <div
        className="w-full h-full"
        style={{
          WebkitMaskImage: 'url(/atmoify-logo.svg)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: 'url(/atmoify-logo.svg)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          background: 'linear-gradient(69deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
        }}
      />
    </div>
  )
}
