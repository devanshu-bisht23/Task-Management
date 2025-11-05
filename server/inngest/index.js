import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-managemnet" });

// Inngest function to save user data to a database

const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=>{
        const {data} = event
        await prisma.user.create({
            data:{
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest func to delte user from the databse

const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        const {data} = event
        await prisma.user.delete({
            where:{
                id: data.id,
            }
        })
    }
)

// Inngest func to update data into the database

const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event})=>{
        const {data} = event
        await prisma.user.update({  
            where:{
                id: data.id
            },
            data:{
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inject func to save workspace data to a database

const syncWorkspaceCreation = inngest.createFunction(
    {id: 'sync-workspace-from-clerk'},
    {event: 'clerk/organization.created'},
    async({event})=>{
        const{data} = event

        //store this data in the db

        await prisma.workspace.create({
            data:{
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url
            }
        })

    // Add Creator of org as admin

        await prisma.workspaceMember.create({

            data:{
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN"
            }
            
        })
    }
)

// Inngest func to update workspace data into the db

const syncWorkSpaceUpdation = inngest.createFunction(
    {id: 'update-workspace-from-clerk'},
    {event: 'clerk/organization.updated'},
    async ({event}) =>{
        const {data} = event;
        await prisma.workspace.update({
            where: {
                id: data.id, //workspace id where we have to update data
            },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url
            }
        })
    }
)

// Inngest func to delete workspace from database

const syncWorkspaceDeletion = inngest.createFunction(
    {id: 'delete-workspace-with-clerk'},
    {event: 'clerk/organization.deleted'},
    async ({event}) => {
        const{data} = event;
        await prisma.workspace.delete({
            where:{
                id: data.id // delete data with this id in the neon database
            }
        })
    }
)

// Inngest Func to save workspace member data to a database

const syncWorkspaceMemberCreation = inngest.createFunction(
    {id: 'sync-workspace-member-from-clerk'},
    {event: 'clerk/organizationInvitation.accepted'},
    async ({event})=>{
        const{data} = event;
        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,
                workspaceId: data.organization_id,
                role: String(data.role_name).toUpperCase(),
            }
        })
    }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserDeletion, 
    syncUserUpdation, 
    syncWorkspaceCreation, 
    syncWorkSpaceUpdation, 
    syncWorkspaceDeletion, 
    syncWorkspaceMemberCreation
];