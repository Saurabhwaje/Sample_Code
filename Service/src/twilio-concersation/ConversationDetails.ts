import { Pool, PoolConnection } from 'mysql2/promise';

class ConversationDetails {
    conversionId: string;
    sourceUser: string;
    targetUser: string;

    constructor(conversionId: string, sourceUser: string, targetUser: string) {
        this.conversionId = conversionId;
        this.sourceUser = sourceUser;
        this.targetUser = targetUser;
    }
}