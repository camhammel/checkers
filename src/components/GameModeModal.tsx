import { ArrowRight02Icon, RobotIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon as Icon } from "@hugeicons/react";

interface GameModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGameModeSelect: (mode: "human" | "computer") => void;
}

export function GameModeModal({
    isOpen,
    onClose,
    onGameModeSelect,
}: GameModeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Select Game Opponent
                </h2>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => onGameModeSelect("human")}
                        className="cursor-pointer w-full py-3 px-6 text-lg font-medium flex items-center gap-4 text-gray-800 hover:bg-gray-100 transition-colors rounded-lg group"
                    >
                        <Icon icon={UserIcon} size={24} />
                        Self
                        <Icon icon={ArrowRight02Icon} size={24} className="ml-auto group-hover:opacity-100 opacity-0 group-hover:delay-200 group-hover:translate-x-2 transition-colors group-hover:transition-all" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onGameModeSelect("computer")}
                        className="cursor-pointer w-full py-3 px-6 text-lg font-medium flex items-center gap-4 text-gray-800 hover:bg-gray-100 transition-colors rounded-lg group"
                    >
                        <Icon icon={RobotIcon} size={24} />
                        Computer
                        <Icon icon={ArrowRight02Icon} size={24} className="ml-auto group-hover:opacity-100 opacity-0 group-hover:delay-200 group-hover:translate-x-2 transition-colors group-hover:transition-all" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer w-full mt-6 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
