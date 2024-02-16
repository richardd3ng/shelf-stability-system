import { ButtonWithLoadingAndError } from "@/components/shared/buttonWithLoadingAndError";
import { CloseableModal } from "@/components/shared/closeableModal";
import { useMutationToCreateAssay } from "@/lib/hooks/experimentDetailPage/useCreateEntityHooks";
import { useExperimentInfo } from "@/lib/hooks/experimentDetailPage/experimentDetailHooks";
import { useExperimentId } from "@/lib/hooks/experimentDetailPage/useExperimentId";
import { fetchDistinctAssayTypes } from "@/lib/controllers/assayTypeController";
import {
    FormControl,
    InputLabel,
    Stack,
    Select,
    MenuItem,
} from "@mui/material";
import { useState } from "react";
import { LocalDate } from "@js-joda/core";
import { MyDatePicker } from "@/components/shared/myDatePicker";

interface NewAssayModalProps {
    open: boolean;
    onClose: () => void;
    week: number;
    conditionId: number;
}

export const NewAssayModal: React.FC<NewAssayModalProps> = (
    props: NewAssayModalProps
) => {
    const experimentId = useExperimentId();
    const { data } = useExperimentInfo(experimentId);
    const [assayTypeId, setAssayTypeId] = useState<number>(-1);
    const {
        isPending,
        isError,
        error,
        mutate: createAssayInDB,
    } = useMutationToCreateAssay();

    const onSubmit = () => {
        createAssayInDB({
            experimentId: experimentId,
            conditionId: props.conditionId,
            type: assayTypeId,
            target_date: data?.experiment.start_date
                .plusWeeks(props.week) ?? null,
            result: null,
        });
    };
    return (
        <CloseableModal
            open={props.open}
            closeFn={props.onClose}
            title={"Add New Assay"}
        >
            {data ? (
                <Stack gap={1}>
                    <FormControl fullWidth>
                        <InputLabel id="Assay Type Select Label">
                            Assay Type
                        </InputLabel>
                        <Select
                            labelId="Assay Type Select Label"
                            id="Assay Type Selection"
                            value={assayTypeId}
                            label="Assay Type"
                            onChange={(e) => {
                                if (typeof e.target.value === "number") {
                                    setAssayTypeId(e.target.value);
                                }
                            }}
                        >
                            {fetchDistinctAssayTypes().map((type: string) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
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
