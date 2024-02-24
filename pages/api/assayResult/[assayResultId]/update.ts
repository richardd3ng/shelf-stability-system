import { db } from "@/lib/api/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiError } from "@/lib/api/error";
import { ApiError } from "next/dist/server/api-utils";
import { AssayResult } from "@prisma/client";
import { getErrorMessage } from "@/lib/api/apiHelpers";
import {
    INVALID_ASSAY_RESULT_ID,
    getAssayResultID,
} from "@/lib/api/apiHelpers";

export default async function updateAssayResultAPI(
    req: NextApiRequest,
    res: NextApiResponse<AssayResult | ApiError>
) {
    const id = getAssayResultID(req);
    if (id === INVALID_ASSAY_RESULT_ID) {
        res.status(400).json(getApiError(400, "Assay result ID is required"));
        return;
    }
    try {
        const updatedAssayResult: AssayResult | null =
            await db.assayResult.update({
                where: {
                    id: id,
                },
                data: req.body,
            });

        if (!updatedAssayResult) {
            res.status(404).json(
                getApiError(
                    404,
                    "Assay result to update does not exist",
                    "Assay Result Not Found"
                )
            );
            return;
        }
        // delete if both result and comment are empty
        if (
            updatedAssayResult.result === null &&
            updatedAssayResult.comment === null
        ) {
            const deletedAssayResult: AssayResult | null =
                await db.assayResult.delete({
                    where: { id: id },
                });
            if (!deletedAssayResult) {
                res.status(404).json(
                    getApiError(
                        404,
                        "Assay result to delete does not exist",
                        "Assay Result Not Found"
                    )
                );
                return;
            }
            res.status(200).json(deletedAssayResult);
            return;
        }
        res.status(200).json(updatedAssayResult);
    } catch (error) {
        console.error(getErrorMessage(error));
        res.status(500).json(
            getApiError(500, `Failed to update assay result on server`)
        );
    }
}
