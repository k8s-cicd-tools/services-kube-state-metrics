
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

const appLabels = { app: "kube-state-metrics" };

// Create a ClusterRole
const clusterRole = new k8s.rbac.v1.ClusterRole("kube-state-metrics", {
    metadata: {
        namespace: "kube-system",
        labels: appLabels,
        name: "kube-state-metrics",
    },
    rules: [
        {
            apiGroups: [""],
            resources: [
                "configmaps",
                "secrets",
                "nodes",
                "pods",
                "services",
                "serviceaccounts",
                "resourcequotas",
                "replicationcontrollers",
                "limitranges",
                "persistentvolumeclaims",
                "persistentvolumes",
                "namespaces",
                "endpoints",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["apps"],
            resources: [
                "statefulsets",
                "daemonsets",
                "deployments",
                "replicasets",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["batch"],
            resources: [
                "cronjobs",
                "jobs",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["autoscaling"],
            resources: [
                "horizontalpodautoscalers",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["authentication.k8s.io"],
            resources: [
                "tokenreviews",
            ],
            verbs: ["create"],
        },
        {
            apiGroups: ["authorization.k8s.io"],
            resources: [
                "subjectaccessreviews",
            ],
            verbs: ["create"],
        },
        {
            apiGroups: ["policy"],
            resources: [
                "poddisruptionbudgets",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["certificates.k8s.io"],
            resources: [
                "certificatesigningrequests",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["storage.k8s.io"],
            resources: [
                "storageclasses",
                "volumeattachments",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["admissionregistration.k8s.io"],
            resources: [
                "mutatingwebhookconfigurations",
                "validatingwebhookconfigurations",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["networking.k8s.io"],
            resources: [
                "networkpolicies",
                "ingresses",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["coordination.k8s.io"],
            resources: [
                "leases",
            ],
            verbs: ["list", "watch"],
        },
        {
            apiGroups: ["rbac.authorization.k8s.io"],
            resources: [
                "clusterrolebindings",
                "clusterroles",
                "rolebindings",
                "roles",
            ],
            verbs: ["list", "watch"],
        },
    ],
});

// Create a ClusterRoleBinding
const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding("kube-state-metrics", {
    metadata: {
        namespace: "kube-system",
        labels: appLabels,
        name: "kube-state-metrics",
    },
    roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "kube-state-metrics",
    },
    subjects: [
        {
            kind: "ServiceAccount",
            name: "kube-state-metrics",
            namespace: "kube-system",
        },
    ],
});

// Create a Deployment
const deployment = new k8s.apps.v1.Deployment("kube-state-metrics", {
    metadata: {
        namespace: "kube-system",
        labels: appLabels,
        name: "kube-state-metrics",
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: appLabels,
        },
        template: {
            metadata: {
                labels: appLabels,
            },
            spec: {
                automountServiceAccountToken: true,
                containers: [
                    {
                        image: "registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.5.0",
                        name: "kube-state-metrics",
                        ports: [
                            {
                                containerPort: 8080,
                                name: "http-metrics",
                            },
                            {
                                containerPort: 8081,
                                name: "telemetry",
                            },
                        ],
                        livenessProbe: {
                            httpGet: {
                                path: "/healthz",
                                port: 8080,
                            },
                            initialDelaySeconds: 5,
                            timeoutSeconds: 5,
                        },
                        readinessProbe: {
                            httpGet: {
                                path: "/",
                                port: 8081,
                            },
                            initialDelaySeconds: 5,
                            timeoutSeconds: 5,
                        },
                        securityContext: {
                            allowPrivilegeEscalation: false,
                            capabilities: {
                                drop: [
                                    "ALL",
                                ],
                            },
                            readOnlyRootFilesystem: true,
                            runAsNonRoot: true,
                            runAsUser: 65534,
                        },
                        resources: {
                            limits: {
                                cpu: "200m",
                                memory: "200Mi",
                            },
                            requests: {
                                cpu: "100m",
                                memory: "100Mi",
                            },
                        },
                    },
                ],
                serviceAccountName: "kube-state-metrics",
                securityContext: {
                    fsGroup: 65534,
                    runAsNonRoot: true,
                    runAsUser: 65534,
                },
            },
        },
    },
});

// Create a Service
const service = new k8s.core.v1.Service("kube-state-metrics", {
    metadata: {
        namespace: "kube-system",
        labels: appLabels,
        name: "kube-state-metrics",
    },
    spec: {
        ports: [
            {
                name: "http-metrics",
                port: 8080,
                protocol: "TCP",
                targetPort: 8080,
            },
            {
                name: "telemetry",
                port: 8081,
                protocol: "TCP",
                targetPort: 8081
            },
        ],
        selector: appLabels,
        type: "ClusterIP",
    },
});

// Create a ServiceAccount
const serviceAccount = new k8s.core.v1.ServiceAccount("kube-state-metrics", {
    metadata: {
        namespace: "kube-system",
        labels: appLabels,
        name: "kube-state-metrics",
    },
    automountServiceAccountToken: false,
});


export const name = deployment.metadata.name;
