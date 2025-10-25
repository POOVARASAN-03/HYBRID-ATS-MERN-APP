const AuthImagePattern = ({ title, subtitle }) => {
    return (
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-12 h-full relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-slate-300 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-32 w-28 h-28 bg-slate-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="max-w-md text-center relative z-10">         
   {/* Interactive Grid Pattern */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:shadow-lg cursor-pointer animate-pulse`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">{title}</h2>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed">{subtitle}</p>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default AuthImagePattern;