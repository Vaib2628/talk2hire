import { db } from "@/firebase/admin";
export async function getInterviewsByUserId (userId) {
    const interviews = await db.collection('interviews').where("userId" , "==" ,userId).orderBy('createdAt', 'desc').get();
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function getLatestInterviews(params = {}) {
    const { userId, limit = 20 } = params;
    
    const interviews = await db.collection('interviews').where('finalized' , '==' , 'true').where('userId', '!=' , userId).orderBy('createdAt', 'desc').limit(limit).get();
    
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

//to get the single interview by id 

export async function getInterviewById(id) {
    const interview = await db.collection('interviews').doc(id).get();
    return {
        id: interview.id,
        ...interview.data()
    };
}