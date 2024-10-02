import { assertUnreachable, SemanticLayerType } from '@lightdash/common';
import { Select, Stack, Text, Title } from '@mantine/core';
import { useState, type FC } from 'react';
import { z } from 'zod';
import useToaster from '../../hooks/toaster/useToaster';
import {
    useProject,
    useProjectSemanticLayerDeleteMutation,
    useProjectSemanticLayerUpdateMutation,
} from '../../hooks/useProject';
import { SettingsGridCard } from '../common/Settings/SettingsCard';
import CubeSemanticLayerForm, {
    cubeSemanticLayerFormSchema,
} from './CubeSemanticLayerForm';
import DbtSemanticLayerForm, {
    dbtSemanticLayerFormSchema,
} from './DbtSemanticLayerForm';

interface Props {
    projectUuid: string;
}

const SemanticLayerOptions = [
    {
        label: 'Cube',
        value: SemanticLayerType.CUBE,
    },
    {
        label: 'DBT',
        value: SemanticLayerType.DBT,
    },
];

const SemanticLayerLabels: Record<SemanticLayerType, string> = {
    [SemanticLayerType.CUBE]: 'Cube',
    [SemanticLayerType.DBT]: 'dbt',
};

const formSchemas = z.union([
    dbtSemanticLayerFormSchema,
    cubeSemanticLayerFormSchema,
]);

const SettingsSemanticLayer: FC<Props> = ({ projectUuid }) => {
    const { data } = useProject(projectUuid);
    const { showToastSuccess } = useToaster();

    const [semanticLayerType, setSemanticLayerType] =
        useState<SemanticLayerType>(
            data?.semanticLayerConnection?.type ?? SemanticLayerType.DBT,
        );

    const projectMutation = useProjectSemanticLayerUpdateMutation(projectUuid);
    const deleteSemanticLayerMutation =
        useProjectSemanticLayerDeleteMutation(projectUuid);

    const handleSubmit = async (
        connectionData: z.infer<typeof formSchemas>,
    ) => {
        await projectMutation.mutateAsync(connectionData);

        showToastSuccess({
            title: `Successfully updated project's semantic layer connection with ${SemanticLayerLabels[semanticLayerType]} credentials.`,
        });

        return false;
    };

    const handleDelete = async () => {
        await deleteSemanticLayerMutation.mutateAsync();

        showToastSuccess({
            title: `Successfully deleted project's semantic layer connection.`,
        });
    };

    return (
        <SettingsGridCard>
            <Stack spacing="sm">
                <Title order={4}>Semantic Layer</Title>

                <Text color="dimmed">
                    Connect your third-party Semantic Layer so you can explore
                    and report on your metric definitions in Lightdash.
                </Text>
            </Stack>

            <Stack>
                <Select
                    label="Semantic Layer Type"
                    data={SemanticLayerOptions}
                    value={semanticLayerType}
                    onChange={(value: SemanticLayerType) =>
                        setSemanticLayerType(value)
                    }
                />

                {semanticLayerType === SemanticLayerType.DBT ? (
                    <DbtSemanticLayerForm
                        isLoading={projectMutation.isLoading}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                        semanticLayerConnection={
                            semanticLayerType ===
                            data?.semanticLayerConnection?.type
                                ? data.semanticLayerConnection
                                : undefined
                        }
                    />
                ) : semanticLayerType === SemanticLayerType.CUBE ? (
                    <CubeSemanticLayerForm
                        isLoading={false}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                        semanticLayerConnection={
                            semanticLayerType ===
                            data?.semanticLayerConnection?.type
                                ? data.semanticLayerConnection
                                : undefined
                        }
                    />
                ) : (
                    assertUnreachable(
                        semanticLayerType,
                        `Unknown semantic layer type: ${semanticLayerType}`,
                    )
                )}
            </Stack>
        </SettingsGridCard>
    );
};

export default SettingsSemanticLayer;