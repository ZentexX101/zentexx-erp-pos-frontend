import React from 'react';

const Button = ({ onClick, children, className = '', type = 'button', ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;




// ✅ Example usage:
{/*import Button from './Button';
<Button onClick={() => alert('Clicked!')}>
    Click Me
</Button>*/}
