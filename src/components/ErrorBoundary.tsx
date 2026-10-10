import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-6 text-center font-['Cairo',sans-serif]">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-4 border-pink-200">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-sm text-slate-600 mb-6">
              تم رصد مشكلة مؤقتة في الشاشة. اضغط على الزر أدناه لإعادة تشغيل التطبيق بنجاح.
            </p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white font-black rounded-2xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              إعادة تحميل الموقع الآن 🚀
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
