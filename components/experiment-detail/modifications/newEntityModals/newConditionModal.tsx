import { ButtonWithLoadingAndError } from "@/components/shared/buttonWithLoadingAndError";
import { CloseableModal } from "@/components/shared/closeableModal";
import { useExperimentInfo } from "@/lib/hooks/experimentDetailPage/experimentDetailHooks";
import { useExperimentId } from "@/lib/hooks/experimentDetailPage/useExperimentId";
import { FormControl, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { ConditionCreationArgs } from "@/lib/controllers/types";
import { useMutationToCreateCondition } from "@/lib/hooks/experimentDetailPage/useCreateEntityHooks";

interface NewConditionModalProps {
    open: boolean;
    onClose: () => void;
}

export const NewConditionModal: React.FC<NewConditionModalProps> = (
    props: NewConditionModalProps
) => {
    const experimentId = useExperimentId();
    const { data } = useExperimentInfo(experimentId);
    const [condition, setCondition] = useState<string>("");
    const {
        isPending,
        isError,
        error,
        mutate: createCondition,
    } = useMutationToCreateCondition();

    const onSubmit = () => {
        if (!condition) {
            return;
        }
        const conditionInfo: ConditionCreationArgs = {
            experimentId: experimentId,
            name: condition,
            control: null,
        };
        createCondition(conditionInfo);
        props.onClose();
    };

    return (
        <CloseableModal
            open={props.open}
            closeFn={props.onClose}
            title={"Add New Condition"}
        >
            {data ? (
                <Stack gap={2}>
                    <FormControl fullWidth>
                        <TextField
                            label="Condition"
                            style={{ marginLeft: 4, marginRight: 4 }}
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        />
                    </FormControl>
                </Stack>
            ) : null}

            <ButtonWithLoadingAndError
                text="Submit"
                isLoading={isPending}
                isError={isError}
                error={error}
                onSubmit={onSubmit}
            />
        </CloseableModal>
    );
};
