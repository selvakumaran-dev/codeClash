import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-0 right-0 m-6 p-6 border border-border-subtle rounded-lg bg-bg-panel shadow-2xl z-50 animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-1">
                            {offlineReady ? 'App is ready for offline use' : 'New content available'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                            {offlineReady
                                ? 'You can use this app without internet connection.'
                                : 'Click reload to update to the latest version.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {needRefresh && (
                            <button
                                className="px-4 py-2 bg-accent-neon text-bg-void rounded-lg font-bold text-sm hover:shadow-neon transition-all"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Reload
                            </button>
                        )}
                        <button
                            className="px-4 py-2 bg-white/5 text-white rounded-lg font-bold text-sm hover:bg-white/10 transition-all border border-white/10"
                            onClick={close}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReloadPrompt
