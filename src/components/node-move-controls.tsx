type NodeMoveControlsProps = {
    moveUpAction: () => Promise<void>;
    moveDownAction: () => Promise<void>;
    canMoveUp: boolean;
    canMoveDown: boolean;
};

export function NodeMoveControls({
    moveUpAction,
    moveDownAction,
    canMoveUp,
    canMoveDown,
}: NodeMoveControlsProps) {
    return (
        <div className="flex gap-1">
            <form action={moveUpAction}>
                <button
                    type="submit"
                    disabled={!canMoveUp}
                    aria-label="Move node up"
                    title="Move up"
                    className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    ↑
                </button>
            </form>

            <form action={moveDownAction}>
                <button
                    type="submit"
                    disabled={!canMoveDown}
                    aria-label="Move node down"
                    title="Move down"
                    className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    ↓
                </button>
            </form>
        </div>
    );
}