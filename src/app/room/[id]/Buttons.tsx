import { cloneElement, ReactElement } from 'react';

const sharedDesign = {
    className:
        'rounded-full border-2 p-1 hover:cursor-pointer hover:bg-black p-2',
    size: 45,
};

export function ToggleButton({
    onIcon,
    offIcon,
    isOn,
    onClickHandler,
}: {
    onIcon: ReactElement<any>;
    offIcon: ReactElement<any>;
    isOn: boolean;
    onClickHandler: Function;
}) {
    return cloneElement(isOn ? onIcon : offIcon, {
        ...sharedDesign,
        color: 'white',
        onClick: onClickHandler,
    });
}

export function ActionButton({
    icon,
    color = 'white',
    onClickHandler,
}: {
    icon: ReactElement<any>;
    color?: string;
    onClickHandler: Function;
}) {
    return cloneElement(icon, {
        ...sharedDesign,
        color: color,
        onClick: onClickHandler,
    });
}
