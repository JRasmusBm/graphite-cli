export declare type TBranchPRState = 'OPEN' | 'CLOSED' | 'MERGED';
export declare type TBranchPRReviewDecision = 'APPROVED' | 'REVIEW_REQUIRED' | 'CHANGES_REQUESTED';
export declare type TBranchPRInfo = {
    number: number;
    base: string;
    url?: string;
    title?: string;
    state?: TBranchPRState;
    reviewDecision?: TBranchPRReviewDecision;
    isDraft?: boolean;
};
export declare type TBranchPriorSubmitInfo = {
    title?: string;
    body?: string;
    reviewers?: string[];
};
export declare type TMeta = {
    parentBranchName?: string;
    parentBranchRevision?: string;
    prevRef?: string;
    prInfo?: TBranchPRInfo;
    priorSubmitInfo?: TBranchPriorSubmitInfo;
};
export declare class MetadataRef {
    _branchName: string;
    constructor(branchName: string);
    private static branchMetadataDirPath;
    private static pathForBranchName;
    static getMeta(branchName: string): TMeta | undefined;
    static updateOrCreate(branchName: string, meta: TMeta): void;
    static copyMetadataRefToRemoteTracking(remote: string, branchName: string): void;
    getPath(): string;
    rename(newBranchName: string): void;
    read(): TMeta | undefined;
    delete(): void;
    static allMetadataRefs(): MetadataRef[];
}
