import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import Link from "next/link";

interface PostEditDeleteButtonsProps {
  postId: string;
  postUserId: string;
}

const PostEditDeleteButton: React.FC<PostEditDeleteButtonsProps> = ({
  postId,
  postUserId,
}) => {
  return (
    <Box>
      <Link href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </Link>

      <IconButton icon={<DeleteIcon />} aria-label="delete" colorScheme="red" />
    </Box>
  );
};

export default PostEditDeleteButton;
