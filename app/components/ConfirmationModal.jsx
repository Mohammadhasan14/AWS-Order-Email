export default function ConfirmationModal({
    handlePrimaryClick,
    handleSecondClick,
    primaryButtonText,
    secondaryButtonText,
    content,
    title
}) {
    return (
        <ui-modal id="confirmation_modal">
            <p >{content}</p>
            <ui-title-bar title={title}>
                <button variant="primary" onClick={handlePrimaryClick}>{primaryButtonText}</button>
                <button onClick={handleSecondClick}>{secondaryButtonText}</button>
            </ui-title-bar>
        </ui-modal>
    )
}
