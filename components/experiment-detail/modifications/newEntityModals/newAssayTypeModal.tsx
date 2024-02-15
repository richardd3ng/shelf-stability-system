import { ButtonWithLoadingAndError } from "@/components/shared/buttonWithLoadingAndError";
import { CloseableModal } from "@/components/shared/closeableModal";
import { ExperimentAdditionsContext } from "@/lib/context/experimentDetailPage/experimentAdditionsContext";
import { useMutationToCreateAssayType } from "@/lib/hooks/experimentDetailPage/useCreateEntityHooks";
import { useExperimentId } from "@/lib/hooks/experimentDetailPage/useExperimentId";
import { Stack, TextField} from "@mui/material";
import { useContext, useState } from "react";

export const NewAssayTypeModal = () => {
    const {isAddingAssayType, setIsAddingAssayType} = useContext(ExperimentAdditionsContext);
    const experimentId = useExperimentId();
    const [name, setName] = useState<string>("");
    const {isPending, isError, error, mutate : createAssayType} = useMutationToCreateAssayType();

    const onSubmit = () => {
        createAssayType({name : name, experimentId : experimentId});
    }
    return (
        <CloseableModal open={isAddingAssayType} closeFn={() => setIsAddingAssayType(false)} title={"Add New Assay Type"}>
            <Stack gap={1}>
                <TextField style={{marginLeft : 4, marginRight : 4}} label="Name" value={name} onChange={(e) => setName(e.target.value)}></TextField>
                <ButtonWithLoadingAndError text="Submit" isLoading={isPending} isError={isError} error={error} onSubmit={onSubmit}/>
            </Stack>
        </CloseableModal>
    );
}
