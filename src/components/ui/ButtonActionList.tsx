import ButtonAction from "./ButtonAction";


export default function ButtonActionList({ actionEdit, actionDelete }: { actionEdit: () => void, actionDelete: () => void }) {
    return (
        <div className="flex items-center gap-2">
            <ButtonAction variant="edit" onClick={actionEdit} />
            <ButtonAction variant="delete" onClick={actionDelete} />
        </div>
    )
}